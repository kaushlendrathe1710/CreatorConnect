import { NotificationItem } from "@/components/NotificationItem";
import { InstagramLayout } from "@/components/InstagramLayout";

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
    <InstagramLayout>
      <div>
        <h2 className="text-2xl font-bold mb-6">Notifications</h2>
        
        <div className="divide-y border rounded-lg">
          {mockNotifications.map((notification) => (
            <NotificationItem key={notification.id} {...notification} />
          ))}
        </div>
      </div>
    </InstagramLayout>
  );
}
