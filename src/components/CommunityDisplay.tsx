import { useQuery } from "@tanstack/react-query";
import type { Post } from "./PostList";
import { supabase } from "../supabase-client";
import { PostItem } from "./PostItem";

interface Props {
  communityId: number;
}

interface PostWithCommunity extends Post {
  communities: {
    name: string;
  };
  like_count: number;
  comment_count: number;
}

export const fetchCommunityPost = async (
  communityId: number
): Promise<PostWithCommunity[]> => {
  // First fetch posts with community info
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("*, communities(name)")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });

  if (postsError) throw new Error(postsError.message);

  // Then fetch counts for each post
  const postsWithCounts = await Promise.all(
    (posts as PostWithCommunity[]).map(async (post) => {
      // Get like count
      const { count: likeCount } = await supabase
        .from("votes")
        .select("*", { count: "exact" })
        .eq("post_id", post.id)
        .eq("vote", 1);

      // Get comment count
      const { count: commentCount } = await supabase
        .from("comments")
        .select("*", { count: "exact" })
        .eq("post_id", post.id);

      return {
        ...post,
        like_count: likeCount || 0,
        comment_count: commentCount || 0
      };
    })
  );

  return postsWithCounts;
};

export const CommunityDisplay = ({ communityId }: Props) => {
  const { data, error, isLoading } = useQuery<PostWithCommunity[], Error>({
    queryKey: ["communityPost", communityId],
    queryFn: () => fetchCommunityPost(communityId),
  });

  if (isLoading)
    return <div className="text-center py-4">Loading communities...</div>;
  if (error)
    return (
      <div className="text-center text-red-500 py-4">
        Error: {error.message}
      </div>
    );
  return (
    <div>
      <h2 className="text-6xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        {data && data[0].communities.name} Community Posts
      </h2>

      {data && data.length > 0 ? (
        <div className="flex flex-wrap gap-6 justify-center">
          {data.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">
          No posts in this community yet.
        </p>
      )}
    </div>
  );
};