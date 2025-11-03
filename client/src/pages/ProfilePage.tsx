import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ProfileHeader } from "@/components/ProfileHeader";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { EditProfileModal } from "@/components/EditProfileModal";
import { InstagramLayout } from "@/components/InstagramLayout";
import { Grid, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User, Post } from "@shared/schema";

export default function ProfilePage() {
  const [, params] = useRoute("/profile/:username");
  const { user: currentUser } = useAuth();
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

  const username = params?.username || "";

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery<User & { followersCount: number; followingCount: number; postsCount: number; isFollowing: boolean; isSubscribed: boolean }>({
    queryKey: ["/api/users", username],
    enabled: !!username,
  });

  // Fetch user posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/users", username, "posts"],
    enabled: !!username,
  });

  const isOwnProfile = !!(currentUser && profile && (currentUser as any).id === profile.id);

  if (profileLoading) {
    return (
      <InstagramLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </InstagramLayout>
    );
  }

  if (!profile) {
    return (
      <InstagramLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </InstagramLayout>
    );
  }

  return (
    <InstagramLayout>
      <div className="pb-8">
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
          isFollowing={profile.isFollowing}
          isSubscribed={profile.isSubscribed}
          onEditProfile={() => setEditProfileModalOpen(true)}
          onSubscribe={() => setSubscriptionModalOpen(true)}
        />

        <Tabs defaultValue="posts" className="mt-6">
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
    </InstagramLayout>
  );
}
