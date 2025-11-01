import { Home, Compass, PlusSquare, Bell, User } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "@/components/CreatePostModal";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

export default function FeedPage() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { user } = useAuth();

  const { data: posts = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/posts/feed"],
  });
  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">CreatorHub</h1>
          
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="w-5 h-5" />
            </Button>
            <ThemeToggle />
            <Avatar className="w-8 h-8 cursor-pointer">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-8 px-4">
        <div className="md:hidden mb-4">
          <SearchBar />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No posts yet. Start following creators!</p>
            <Button onClick={() => setShowCreatePost(true)} data-testid="button-create-first-post">
              Create your first post
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
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
      </main>

      <CreatePostModal open={showCreatePost} onOpenChange={setShowCreatePost} />

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t h-16 flex items-center justify-around z-50">
        <Button variant="ghost" size="icon" data-testid="button-nav-home">
          <Home className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon" data-testid="button-nav-explore">
          <Compass className="w-6 h-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowCreatePost(true)}
          data-testid="button-nav-create"
        >
          <PlusSquare className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon" data-testid="button-nav-notifications">
          <Bell className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon" data-testid="button-nav-profile">
          <User className="w-6 h-6" />
        </Button>
      </nav>
    </div>
  );
}
