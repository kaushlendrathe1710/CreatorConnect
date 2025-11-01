import { Home, Search, Compass, MessageCircle, Heart, PlusSquare, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/NotificationBell";
import { CreatePostModal } from "@/components/CreatePostModal";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface InstagramLayoutProps {
  children: React.ReactNode;
}

export function InstagramLayout({ children }: InstagramLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);

  const { data: suggestedUsers = [] } = useQuery<any[]>({
    queryKey: ["/api/users/suggested"],
  });

  const displayName = (user as any)?.firstName && (user as any)?.lastName 
    ? `${(user as any).firstName} ${(user as any).lastName}`
    : (user as any)?.name || (user as any)?.username || "User";

  const isAdmin = (user as any)?.isAdmin;

  const navItems = [
    { icon: Home, label: "Home", path: "/", testId: "nav-home" },
    { icon: Search, label: "Search", path: "/search", testId: "nav-search" },
    { icon: Compass, label: "Explore", path: "/explore", testId: "nav-explore" },
    { icon: MessageCircle, label: "Messages", path: "/messages", testId: "nav-messages" },
    { icon: Heart, label: "Notifications", path: "/notifications", testId: "nav-notifications", isSpecial: true },
    { icon: PlusSquare, label: "Create", onClick: () => setShowCreatePost(true), testId: "nav-create" },
    { icon: User, label: "Profile", path: "/dashboard", testId: "nav-profile" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-background p-4 hidden lg:block">
        <div className="flex flex-col h-full">
          <h1 className="text-2xl font-bold mb-8 px-3" data-testid="app-logo">CreatorHub</h1>
          
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start gap-4 px-3 py-6 text-base hover-elevate"
                onClick={() => item.onClick ? item.onClick() : item.path && setLocation(item.path)}
                data-testid={item.testId}
              >
                {item.isSpecial ? (
                  <Heart className="w-6 h-6" />
                ) : (
                  <item.icon className="w-6 h-6" />
                )}
                <span className="font-normal">{item.label}</span>
              </Button>
            ))}
            
            {/* Admin Panel Button - Only visible to admins */}
            {isAdmin && (
              <Button
                variant="ghost"
                className="w-full justify-start gap-4 px-3 py-6 text-base hover-elevate border-t mt-2 pt-4"
                onClick={() => setLocation("/admin")}
                data-testid="nav-admin-panel"
              >
                <Shield className="w-6 h-6 text-primary" />
                <span className="font-semibold text-primary">Admin Panel</span>
              </Button>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64">
        <div className="max-w-[935px] mx-auto flex gap-8 p-4 lg:p-8">
          {/* Center Feed */}
          <div className="flex-1 max-w-[630px]">
            {children}
          </div>

          {/* Right Sidebar - Suggestions */}
          <aside className="hidden xl:block w-[320px] sticky top-8 h-fit">
            <div className="space-y-4">
              {/* Current User Card */}
              <div className="flex items-center gap-3 mb-6">
                <Avatar 
                  className="w-14 h-14 cursor-pointer" 
                  onClick={() => setLocation("/dashboard")}
                  data-testid="sidebar-avatar"
                >
                  <AvatarImage src={(user as any)?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(user as any)?.email}`} />
                  <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" data-testid="sidebar-username">
                    {(user as any)?.username}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {displayName}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary text-xs font-semibold"
                  onClick={() => setLocation("/dashboard")}
                  data-testid="button-switch"
                >
                  Switch
                </Button>
              </div>

              {/* Suggested For You */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Suggested for you
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs font-semibold h-auto p-0"
                    data-testid="button-see-all"
                  >
                    See All
                  </Button>
                </div>

                <div className="space-y-3">
                  {suggestedUsers.slice(0, 5).map((suggestedUser: any) => (
                    <div key={suggestedUser.id} className="flex items-center gap-3">
                      <Avatar 
                        className="w-9 h-9 cursor-pointer"
                        onClick={() => setLocation(`/profile/${suggestedUser.username}`)}
                      >
                        <AvatarImage src={suggestedUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${suggestedUser.username}`} />
                        <AvatarFallback>{suggestedUser.username?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p 
                          className="text-sm font-semibold truncate cursor-pointer hover:text-muted-foreground"
                          onClick={() => setLocation(`/profile/${suggestedUser.username}`)}
                        >
                          {suggestedUser.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {suggestedUser.isCreator ? "Creator" : "Suggested for you"}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary text-xs font-semibold h-auto p-0"
                        data-testid={`button-follow-${suggestedUser.username}`}
                      >
                        Follow
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Links */}
              <div className="text-xs text-muted-foreground space-y-2 pt-6">
                <div className="flex flex-wrap gap-2">
                  <a href="#" className="hover:underline">About</a>
                  <span>·</span>
                  <a href="#" className="hover:underline">Help</a>
                  <span>·</span>
                  <a href="#" className="hover:underline">Press</a>
                  <span>·</span>
                  <a href="#" className="hover:underline">API</a>
                  <span>·</span>
                  <a href="#" className="hover:underline">Jobs</a>
                  <span>·</span>
                  <a href="#" className="hover:underline">Privacy</a>
                  <span>·</span>
                  <a href="#" className="hover:underline">Terms</a>
                </div>
                <p className="text-muted-foreground/60">© 2025 CREATORHUB</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <CreatePostModal open={showCreatePost} onOpenChange={setShowCreatePost} />
    </div>
  );
}
