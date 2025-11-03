import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { InstagramLayout } from "@/components/InstagramLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Grid3x3, TrendingUp, Settings, Share2, Edit, 
  Heart, MessageCircle, Lock, BarChart3, Users, DollarSign,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { CreatePostModal } from "@/components/CreatePostModal";

export default function DashboardPage() {
  const { user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  // Type user properly
  const currentUser = user as any;

  const { data: posts = [] } = useQuery<any[]>({
    queryKey: currentUser ? ["/api/posts/user", currentUser.id] : [],
    enabled: !!currentUser,
  });

  const { data: stats } = useQuery<any>({
    queryKey: currentUser ? ["/api/users/stats", currentUser.id] : [],
    enabled: !!currentUser,
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (!currentUser) {
    return null;
  }

  const displayName = currentUser.firstName && currentUser.lastName 
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : currentUser.username;

  const postsCount = posts.length;
  const followersCount = currentUser.followersCount || 0;
  const followingCount = currentUser.followingCount || 0;

  return (
    <InstagramLayout>
      <div className="pb-8">
        {/* Profile Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            {/* Avatar */}
            <div className="flex justify-center md:justify-start w-full md:w-auto">
              <Avatar className="w-32 h-32 md:w-40 md:h-40">
                <AvatarImage 
                  src={currentUser.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`} 
                />
                <AvatarFallback className="text-4xl">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full">
              {/* Username and Actions */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold" data-testid="text-username">
                    {currentUser.username}
                  </h2>
                  {currentUser.isCreator && (
                    <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
                      Creator
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="secondary"
                    size="sm"
                    data-testid="button-edit-profile"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline"
                    size="icon"
                    data-testid="button-share-profile"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="icon"
                    data-testid="button-settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mb-6" data-testid="profile-stats">
                <div className="text-center md:text-left">
                  <div className="font-semibold text-lg" data-testid="stat-posts">
                    {postsCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center md:text-left cursor-pointer hover-elevate">
                  <div className="font-semibold text-lg" data-testid="stat-followers">
                    {followersCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center md:text-left cursor-pointer hover-elevate">
                  <div className="font-semibold text-lg" data-testid="stat-following">
                    {followingCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <p className="font-semibold">{displayName}</p>
                {currentUser.bio && (
                  <p className="text-sm whitespace-pre-wrap" data-testid="text-bio">
                    {currentUser.bio}
                  </p>
                )}
                {currentUser.isCreator && currentUser.subscriptionPrice && (
                  <p className="text-sm text-muted-foreground">
                    Subscribe for ${(currentUser.subscriptionPrice / 100).toFixed(2)}/month
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="posts" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground"
              data-testid="tab-posts"
            >
              <Grid3x3 className="w-4 h-4" />
              <span className="hidden md:inline">Posts</span>
            </TabsTrigger>
            
            {currentUser.isCreator && (
              <TabsTrigger 
                value="analytics"
                className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground"
                data-testid="tab-analytics"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden md:inline">Analytics</span>
              </TabsTrigger>
            )}

            <TabsTrigger 
              value="about"
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground"
              data-testid="tab-about"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">About</span>
            </TabsTrigger>
          </TabsList>

          {/* Posts Grid Tab */}
          <TabsContent value="posts" className="mt-6">
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Grid3x3 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Share your first post</h3>
                <p className="text-muted-foreground mb-4">
                  When you share photos and videos, they'll appear on your profile.
                </p>
                <Button 
                  onClick={() => setShowCreatePost(true)}
                  data-testid="button-share-first-post"
                >
                  Share your first post
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 md:gap-2">
                {posts.map((post) => (
                  <Card 
                    key={post.id}
                    className="group relative aspect-square overflow-hidden cursor-pointer border-0"
                    data-testid={`post-${post.id}`}
                  >
                    <div className="absolute inset-0">
                      {post.mediaURL ? (
                        <img 
                          src={post.mediaURL} 
                          alt={post.caption || "Post"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Grid3x3 className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Subscriber-only overlay */}
                      {post.isSubscriberOnly && (
                        <div className="absolute top-2 right-2">
                          <Lock className="w-5 h-5 text-white drop-shadow" />
                        </div>
                      )}

                      {/* Hover overlay with stats */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-white">
                          <Heart className="w-6 h-6 fill-white" />
                          <span className="font-semibold">{post.likesCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <MessageCircle className="w-6 h-6 fill-white" />
                          <span className="font-semibold">{post.commentsCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab (Creator Only) */}
          {currentUser.isCreator && (
            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Total Subscribers</p>
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold" data-testid="stat-subscribers">
                      {stats?.subscribersCount || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Active this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                      <DollarSign className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold" data-testid="stat-revenue">
                      ${(stats?.monthlyRevenue || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recurring income
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Engagement Rate</p>
                      <TrendingUp className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold" data-testid="stat-engagement">
                      {stats?.engagementRate || 0}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Avg. across all posts
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground py-8">
                      Detailed analytics coming soon
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* About Tab */}
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Email</p>
                  <p data-testid="text-email">{currentUser.email}</p>
                </div>

                {currentUser.phoneNumber && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Phone</p>
                    <p data-testid="text-phone">{currentUser.phoneNumber}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Account Type</p>
                  <p>{currentUser.isCreator ? "Creator Account" : "Personal Account"}</p>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleLogout}
                    data-testid="button-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <CreatePostModal open={showCreatePost} onOpenChange={setShowCreatePost} />
      </div>
    </InstagramLayout>
  );
}
