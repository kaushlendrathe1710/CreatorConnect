import { Home, Compass, PlusSquare, Bell, User } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const mockPosts = [
  {
    id: 1,
    username: "sarahcreates",
    displayName: "Sarah Creates",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    caption: "New collection dropping soon! 🎨✨",
    likes: 1234,
    comments: 56,
    timestamp: "2 hours ago",
    isCreator: true,
  },
  {
    id: 2,
    username: "mikephoto",
    displayName: "Mike Photography",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    caption: "Golden hour magic ✨📸",
    likes: 892,
    comments: 34,
    timestamp: "5 hours ago",
    isCreator: true,
    isSubscriberOnly: true,
  },
  {
    id: 3,
    username: "alexfitness",
    displayName: "Alex Fitness",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
    caption: "Morning workout complete! 💪 Who's training today?",
    likes: 2341,
    comments: 128,
    timestamp: "1 day ago",
    isCreator: true,
  },
];

export default function FeedPage() {
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

        <div className="space-y-8">
          {mockPosts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t h-16 flex items-center justify-around z-50">
        <Button variant="ghost" size="icon" data-testid="button-nav-home">
          <Home className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon" data-testid="button-nav-explore">
          <Compass className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon" data-testid="button-nav-create">
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
