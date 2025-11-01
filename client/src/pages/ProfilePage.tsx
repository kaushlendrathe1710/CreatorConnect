import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ProfileHeader } from "@/components/ProfileHeader";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { EditProfileModal } from "@/components/EditProfileModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Grid, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User, Post } from "@shared/schema";

export default function ProfilePage() {
  const [, params] = useRoute("/profile/:username");
  const [, setLocation] = useLocation();
  const { user: currentUser } = useAuth();
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

  const username = params?.username || "";

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery<User & { followersCount: number; followingCount: number; postsCount: number }>({
    queryKey: ["/api/users", username],
    enabled: !!username,
  });

  // Fetch user posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/users", username, "posts"],
    enabled: !!username,
  });

  const isOwnProfile = !!(currentUser && profile && currentUser.id === profile.id);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/feed")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <h2 className="font-semibold">{profile.username || profile.firstName}</h2>
          
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        <ProfileHeader
          username={profile.username || ""}
          displayName={`${profile.firstName || ""} ${profile.lastName || ""}`.trim() || profile.username || "User"}
          bio={profile.bio || ""}
          avatarUrl={profile.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`}
          followers={profile.followersCount}
          following={profile.followingCount}
          posts={profile.postsCount}
          isCreator={profile.isCreator}
          subscriptionPrice={profile.subscriptionPrice || undefined}
          isOwnProfile={isOwnProfile}
          onEditProfile={() => setEditProfileModalOpen(true)}
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
            {postsLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading posts...
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No posts yet
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="aspect-square bg-muted hover-elevate cursor-pointer overflow-hidden"
                    data-testid={`card-post-${post.id}`}
                  >
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.caption || "Post"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-4 text-sm text-muted-foreground">
                        {post.caption?.substring(0, 100) || "No content"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
        creatorName={`${profile.firstName || ""} ${profile.lastName || ""}`.trim() || profile.username || "Creator"}
        price={profile.subscriptionPrice || 0}
        creatorId={profile.id}
      />

      {isOwnProfile && (
        <EditProfileModal
          isOpen={editProfileModalOpen}
          onClose={() => setEditProfileModalOpen(false)}
          user={profile}
        />
      )}
    </div>
  );
}
