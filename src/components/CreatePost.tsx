import { useState } from "react";
import type { ChangeEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { fetchCommunities } from "./CommunityList";
import imageCompression from "browser-image-compression";

interface Community {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface PostInput {
  title: string;
  content: string;
  avatar_url: string | null;
  community_id?: number | null;
  user_id: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const createPost = async (post: PostInput, imageFile: File) => {
  if (!post.user_id) {
    throw new Error('User ID is required');
  }

  // Compress image only if it's larger than 1MB
  let fileToUpload = imageFile;
  if (imageFile.size > 1024 * 1024) {
    fileToUpload = await imageCompression(imageFile, {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    });
  }

  const fileExt = imageFile.name.split('.').pop();
  const fileName = `${post.user_id}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Upload with error handling
  const { error: uploadError } = await supabase.storage
    .from("post-images")
    .upload(filePath, fileToUpload);

  if (uploadError) throw new Error(uploadError.message);

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("post-images")
    .getPublicUrl(filePath);

  // Insert post with user_id
  const { data, error } = await supabase
    .from("posts")
    .insert({ 
      ...post, 
      image_url: publicUrl,
      user_id: post.user_id 
    })
    .select();

  if (error) throw new Error(error.message);

  return data;
};

export const CreatePost = () => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [communityId, setCommunityId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { user } = useAuth();

  const { data: communities } = useQuery<Community[], Error>({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { post: PostInput; imageFile: File }) => {
      try {
        return await createPost(data.post, data.imageFile);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to create post');
        throw error;
      }
    },
    onSuccess: () => {
      setTitle("");
      setContent("");
      setCommunityId(null);
      setSelectedFile(null);
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    
    if (!user?.id) {
      setErrorMessage("You must be logged in to create a post");
      return;
    }

    if (!selectedFile) {
      setErrorMessage("Please select an image file");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage(`File size too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
      return;
    }

    mutate({
      post: {
        title,
        content,
        avatar_url: user?.user_metadata.avatar_url || null,
        community_id: communityId,
        user_id: user.id
      },
      imageFile: selectedFile,
    });
  };

  const handleCommunityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCommunityId(value ? Number(value) : null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].size > MAX_FILE_SIZE) {
        setErrorMessage(`File size too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
        return;
      }
      setSelectedFile(e.target.files[0]);
      setErrorMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      <div>
        <label htmlFor="title" className="block mb-2 font-medium">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-white/10 bg-transparent p-2 rounded"
          required
          disabled={isPending}
        />
      </div>

      <div>
        <label htmlFor="content" className="block mb-2 font-medium">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-white/10 bg-transparent p-2 rounded"
          rows={5}
          required
          disabled={isPending}
        />
      </div>

      <div>
        <label htmlFor="community" className="block mb-2 font-medium">
          Select Community
        </label>
        <select
          id="community"
          onChange={handleCommunityChange}
          className="w-full border border-white/10 bg-black p-2 rounded"
          disabled={isPending}
        >
          <option value={""}>-- Choose a Community --</option>
          {communities?.map((community) => (
            <option key={community.id} value={community.id}>
              {community.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="image" className="block mb-2 font-medium">
          Upload Image (max 10MB)
        </label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-gray-200"
          disabled={isPending}
          required
        />
        {selectedFile && (
          <p className="text-sm text-gray-400 mt-1">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      <button
        type="submit"
        className="bg-purple-500 text-white px-4 py-2 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isPending}
      >
        {isPending ? "Creating..." : "Create Post"}
      </button>

      {errorMessage && (
        <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-200">
          {errorMessage}
        </div>
      )}
    </form>
  );
};