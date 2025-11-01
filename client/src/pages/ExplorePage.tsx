import { InstagramLayout } from "@/components/InstagramLayout";
import { PostCard } from "@/components/PostCard";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Compass } from "lucide-react";

export default function ExplorePage() {
  const { data: posts = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/posts/feed"],
  });

  // Show all public posts for exploration
  const publicPosts = posts.filter((post) => !post.isSubscriberOnly);

  return (
    <InstagramLayout>
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">Explore</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : publicPosts.length === 0 ? (
          <div className="text-center py-12">
            <Compass className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">No posts to explore yet</p>
            <p className="text-sm text-muted-foreground">
              Check back later for new content
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {publicPosts.map((post) => (
              <div
                key={post.id}
                className="aspect-square relative group cursor-pointer overflow-hidden"
                data-testid={`explore-post-${post.id}`}
              >
                <img
                  src={post.mediaURL}
                  alt={post.caption || "Post"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                  <div className="text-white font-semibold flex items-center gap-2">
                    <span>❤️</span> {post.likesCount || 0}
                  </div>
                  <div className="text-white font-semibold flex items-center gap-2">
                    <span>💬</span> {post.commentsCount || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </InstagramLayout>
  );
}
