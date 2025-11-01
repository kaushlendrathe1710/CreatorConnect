import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Heart, MessageCircle, UserPlus, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Notification, User } from "@shared/schema";

interface EnrichedNotification extends Notification {
  actor: User | null;
}

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  subscription: DollarSign,
};

export function NotificationBell() {
  const { data: notifications = [], isLoading } = useQuery<EnrichedNotification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread/count"],
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest("PUT", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread/count"] });
    },
  });

  const handleNotificationClick = (notification: EnrichedNotification) => {
    // Prevent duplicate requests while mutation is pending
    if (!notification.isRead && !markAsReadMutation.isPending) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const unreadCount = unreadData?.count || 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              data-testid="badge-unread-count"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b p-4">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || Bell;
                
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 text-left hover-elevate transition-colors ${
                      !notification.isRead ? "bg-muted/30" : ""
                    }`}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex gap-3">
                      {notification.actor ? (
                        <Avatar className="w-10 h-10">
                          <AvatarImage 
                            src={notification.actor.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.actor.id}`} 
                          />
                          <AvatarFallback>
                            {notification.actor.firstName?.[0] || notification.actor.username?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          {notification.actor && (
                            <span className="font-semibold">
                              {notification.actor.firstName && notification.actor.lastName
                                ? `${notification.actor.firstName} ${notification.actor.lastName}`
                                : notification.actor.username || "Someone"}
                            </span>
                          )}{" "}
                          <span className="text-muted-foreground">
                            {notification.message}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
