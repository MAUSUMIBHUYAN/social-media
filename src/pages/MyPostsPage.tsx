import { PostList } from "../components/PostList";

export const MyPostsPage = () => {
  return (
    <div className="pt-10">
      <h2 className="text-6xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        My Posts
      </h2>
      <div>
        <PostList onlyMyPosts={true} />
      </div>
    </div>
  );
};