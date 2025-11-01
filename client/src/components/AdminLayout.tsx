import { Users, FileText, BarChart3, Settings, Shield, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: BarChart3, label: "Dashboard", path: "/admin", testId: "admin-nav-dashboard" },
    { icon: Users, label: "Users", path: "/admin/users", testId: "admin-nav-users" },
    { icon: FileText, label: "Posts", path: "/admin/posts", testId: "admin-nav-posts" },
    { icon: Settings, label: "Settings", path: "/admin/settings", testId: "admin-nav-settings" },
    { icon: Home, label: "Back to App", path: "/", testId: "admin-nav-back" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-background p-4">
        <div className="flex flex-col h-full">
          <div className="mb-8">
            <div className="flex items-center gap-2 px-3 mb-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold" data-testid="admin-logo">Admin Panel</h1>
            </div>
            <p className="text-sm text-muted-foreground px-3">
              {(user as any)?.email}
            </p>
          </div>
          
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant={location === item.path ? "secondary" : "ghost"}
                className="w-full justify-start gap-4 px-3 py-6 text-base hover-elevate"
                onClick={() => setLocation(item.path)}
                data-testid={item.testId}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-normal">{item.label}</span>
              </Button>
            ))}
          </nav>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground px-3">
              CreatorHub Admin v1.0
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
