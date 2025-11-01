import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { InstagramLayout } from "@/components/InstagramLayout";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export default function FeedPage() {
  const { data: posts = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/posts/feed"],
  });

  return (
    <InstagramLayout>
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading feed...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No posts yet. Start following creators to see their content!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              postId={post.id}
              username={post.user?.username || ""}
              displayName={`${post.user?.firstName || ""} ${post.user?.lastName || ""}`.trim() || post.user?.username || ""}
              avatarUrl={post.user?.avatarUrl}
              imageUrl={post.mediaURL}
              caption={post.caption}
              likes={post.likesCount || 0}
              comments={post.commentsCount || 0}
              timestamp={formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              isSubscriberOnly={post.isSubscriberOnly}
              isCreator={post.user?.isCreator}
              hasLiked={post.hasLiked}
              canView={post.canView !== false}
            />
          ))}
        </div>
      )}
    </InstagramLayout>
  );
}
