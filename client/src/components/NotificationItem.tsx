import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, UserPlus, DollarSign } from "lucide-react";

interface NotificationItemProps {
  type: "like" | "comment" | "follow" | "subscription";
  username: string;
  avatarUrl?: string;
  message: string;
  timestamp: string;
}

export function NotificationItem({
  type,
  username,
  avatarUrl,
  message,
  timestamp,
}: NotificationItemProps) {
  const iconMap = {
    like: Heart,
    comment: MessageCircle,
    follow: UserPlus,
    subscription: DollarSign,
  };

  const Icon = iconMap[type];

  return (
    <div className="flex gap-3 p-4 hover-elevate rounded-md">
      <Avatar className="w-10 h-10">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{username[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-semibold">{username}</span> {message}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
