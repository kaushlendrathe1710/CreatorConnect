import { NotificationItem } from "../NotificationItem";

export default function NotificationItemExample() {
  return (
    <div className="max-w-md mx-auto p-4 space-y-2">
      <NotificationItem
        type="like"
        username="john_doe"
        message="liked your post"
        timestamp="5 minutes ago"
      />
      <NotificationItem
        type="comment"
        username="jane_smith"
        message="commented on your post"
        timestamp="1 hour ago"
      />
      <NotificationItem
        type="follow"
        username="creator_pro"
        message="started following you"
        timestamp="2 hours ago"
      />
      <NotificationItem
        type="subscription"
        username="fan_account"
        message="subscribed to your content"
        timestamp="1 day ago"
      />
    </div>
  );
}
