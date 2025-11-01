import { NotificationItem } from "@/components/NotificationItem";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const mockNotifications = [
  {
    id: 1,
    type: "like" as const,
    username: "john_doe",
    message: "liked your post",
    timestamp: "5 minutes ago",
  },
  {
    id: 2,
    type: "comment" as const,
    username: "jane_smith",
    message: "commented on your post: 'This is amazing!'",
    timestamp: "1 hour ago",
  },
  {
    id: 3,
    type: "follow" as const,
    username: "creator_pro",
    message: "started following you",
    timestamp: "2 hours ago",
  },
  {
    id: 4,
    type: "subscription" as const,
    username: "fan_account",
    message: "subscribed to your content",
    timestamp: "1 day ago",
  },
  {
    id: 5,
    type: "like" as const,
    username: "art_lover",
    message: "liked your post",
    timestamp: "2 days ago",
  },
];

export default function NotificationsPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Notifications</h1>
          </div>
          
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        <div className="divide-y">
          {mockNotifications.map((notification) => (
            <NotificationItem key={notification.id} {...notification} />
          ))}
        </div>
      </main>
    </div>
  );
}
