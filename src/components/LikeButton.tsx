import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";

interface Props {
  postId: number;
}

interface Vote {
  id: number;
  post_id: number;
  user_id: string;
  vote: number;
}

// Memoize vote function to prevent recreating on every render
const vote = async (postId: number, userId: string) => {
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingVote) {
    await supabase.from("votes").delete().eq("id", existingVote.id);
  } else {
    await supabase.from("votes").insert({ 
      post_id: postId, 
      user_id: userId, 
      vote: 1 
    });
  }
};

// Optimized fetch - only get needed columns and count likes server-side
const fetchVoteData = async (postId: number) => {
  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("user_id, vote")
    .eq("post_id", postId);

  const { count, error: countError } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId)
    .eq("vote", 1);

  if (votesError || countError) {
    throw new Error(votesError?.message || countError?.message);
  }

  return {
    votes: votes as Pick<Vote, "user_id" | "vote">[],
    likeCount: count || 0
  };
};

export const LikeButton = ({ postId }: Props) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Combined query to get both votes and count in one request
  const {
    data: voteData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["votes", postId],
    queryFn: () => fetchVoteData(postId),
    // Consider removing refetchInterval or increasing it
    refetchInterval: 30000, // Increased from 5s to 30s
  });

  const { mutate } = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("You must be logged in to like posts!");
      return vote(postId, user.id);
    },
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["votes", postId] });
      
      const previousData = queryClient.getQueryData(["votes", postId]);
      
      queryClient.setQueryData(["votes", postId], (old: any) => {
        const userVote = old?.votes?.find((v: any) => v.user_id === user?.id);
        const newLikeCount = userVote 
          ? old.likeCount - 1 
          : old.likeCount + 1;
        
        const newVotes = userVote
          ? old.votes.filter((v: any) => v.user_id !== user?.id)
          : [...old.votes, { user_id: user?.id, vote: 1 }];
        
        return {
          votes: newVotes,
          likeCount: newLikeCount
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(["votes", postId], context?.previousData);
    },
    onSettled: () => {
      // Final data confirmation
      queryClient.invalidateQueries({ queryKey: ["votes", postId] });
    }
  });

  if (isLoading) return <div className="w-6 h-6" />;
  if (error) return <div>Error loading likes</div>;

  const likeCount = voteData?.likeCount || 0;
  const userHasLiked = voteData?.votes.some(v => v.user_id === user?.id) || false;

  return (
    <button
      onClick={() => mutate()}
      className={`flex items-center space-x-1 px-3 py-1 cursor-pointer rounded transition-colors duration-150 ${
        userHasLiked ? "text-pink-500" : "text-gray-400"
      }`}
      aria-label={userHasLiked ? "Unlike post" : "Like post"}
    >
      {userHasLiked ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
      <span>{likeCount}</span>
    </button>
  );
};