import { Link } from "react-router-dom";
import type { Post } from "./PostList";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase-client";

interface Props {
  post: Post;
  showDelete?: boolean;
}

export const PostItem = ({ post, showDelete = false }: Props) => {
  const { user } = useAuth();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id);

      if (error) throw error;
      
      // You might want to refresh the list after deletion
      window.location.reload();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-pink-600/30 to-purple-600/30 blur-sm opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"></div>
      
      <Link to={`/post/${post.id}`} className="block relative z-10 h-full">
        <div className="h-full bg-gray-900/50 border border-gray-800 rounded-xl text-white flex flex-col p-5 transition-all duration-300 group-hover:bg-gray-800/70 group-hover:border-gray-700">
          <div className="flex items-start space-x-3">
            {post.avatar_url ? (
              <img
                src={post.avatar_url}
                alt="User Avatar"
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tl from-purple-600 to-blue-600 flex-shrink-0" />
            )}
            <h3 className="text-lg font-semibold line-clamp-2 leading-tight">
              {post.title}
            </h3>
          </div>

          <div className="mt-4 aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-contain p-1"
              loading="lazy"
            />
          </div>

          <div className="flex justify-between items-center mt-4 text-gray-400">
            <div className="flex items-center space-x-4">
              {showDelete && user?.id === post.user_id && (
                <button 
                  onClick={handleDelete}
                  className="text-red-400 hover:text-red-300 transition-colors text-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
              <div className="flex items-center space-x-1">
                <span>❤️</span>
                <span>{post.like_count ?? 0}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <span>💬</span>
              <span>{post.comment_count ?? 0}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};