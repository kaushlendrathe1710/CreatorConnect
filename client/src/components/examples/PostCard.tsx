import { PostCard } from "../PostCard";

export default function PostCardExample() {
  return (
    <div className="max-w-md mx-auto p-4">
      <PostCard
        username="sarahcreates"
        displayName="Sarah Creates"
        avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
        imageUrl="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
        caption="New collection dropping soon! 🎨✨"
        likes={1234}
        comments={56}
        timestamp="2 hours ago"
        isCreator={true}
      />
    </div>
  );
}
