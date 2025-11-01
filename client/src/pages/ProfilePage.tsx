import { useState } from "react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Grid, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockPosts = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400",
];

export default function ProfilePage() {
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <h2 className="font-semibold">Sarah Creates</h2>
          
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        <ProfileHeader
          username="sarahcreates"
          displayName="Sarah Creates"
          bio="Digital artist & content creator 🎨 Sharing exclusive tutorials and behind-the-scenes content"
          avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
          followers={15234}
          following={342}
          posts={128}
          isCreator={true}
          subscriptionPrice={9.99}
        />

        <Tabs defaultValue="posts" className="px-6">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="posts" data-testid="tab-posts">
              <Grid className="w-4 h-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="liked" data-testid="tab-liked">
              <Heart className="w-4 h-4 mr-2" />
              Liked
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4">
            <div className="grid grid-cols-3 gap-1">
              {mockPosts.map((url, index) => (
                <div
                  key={index}
                  className="aspect-square bg-muted hover-elevate cursor-pointer overflow-hidden"
                >
                  <img
                    src={url}
                    alt={`Post ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="liked" className="mt-4">
            <div className="text-center py-12 text-muted-foreground">
              No liked posts yet
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        creatorName="Sarah Creates"
        price={9.99}
      />
    </div>
  );
}
