import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { PostItem } from "./PostItem";
import { useAuth } from "../context/AuthContext";

export interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
  image_url: string;
  user_id: string;
  avatar_url?: string;
  like_count?: number;
  comment_count?: number;
}

const fetchPosts = async (userId?: string): Promise<Post[]> => {
  let query = supabase.rpc("get_posts_with_counts");
  
  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data as Post[];
};

interface PostListProps {
  onlyMyPosts?: boolean;
}

export const PostList = ({ onlyMyPosts = false }: PostListProps) => {
  const { user } = useAuth();
  const { data, error, isLoading } = useQuery<Post[], Error>({
    queryKey: ["posts", onlyMyPosts ? user?.id : ""],
    queryFn: () => fetchPosts(onlyMyPosts ? user?.id : undefined),
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
      {data?.map((post) => (
        <PostItem post={post} key={post.id} showDelete={onlyMyPosts} />
      ))}
    </div>
  );
};