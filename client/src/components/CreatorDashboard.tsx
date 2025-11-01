import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, TrendingUp, Eye, FileText } from "lucide-react";
import type { User, Subscription } from "@shared/schema";

interface DashboardStats {
  subscribersCount: number;
  monthlyRevenue: number;
  totalEarnings: number;
  postsCount: number;
  totalViews: number;
}

interface EnrichedSubscription extends Subscription {
  subscriber: User;
}

export function CreatorDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: subscribers = [], isLoading: subscribersLoading } = useQuery<EnrichedSubscription[]>({
    queryKey: ["/api/dashboard/subscribers"],
  });

  if (statsLoading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Unable to load dashboard. Make sure you are a creator.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Creator Dashboard</h2>
        <p className="text-muted-foreground">Track your growth and earnings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-subscribers">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscribers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-subscribers">
              {stats.subscribersCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Paying subscribers
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-monthly-revenue">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-monthly-revenue">
              ${stats.monthlyRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Recurring income
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-earnings">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-earnings">
              ${stats.totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated lifetime
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-post-views">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Content Stats
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-post-views">
              {stats.postsCount}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {stats.totalViews.toLocaleString()} views
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          {subscribersLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading subscribers...
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subscribers yet. Keep creating great content!
            </div>
          ) : (
            <div className="space-y-4">
              {subscribers.slice(0, 10).map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/30 hover-elevate"
                  data-testid={`card-subscriber-${sub.subscriberId}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage 
                        src={sub.subscriber.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.subscriber.id}`} 
                      />
                      <AvatarFallback>
                        {sub.subscriber.firstName?.[0] || sub.subscriber.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {sub.subscriber.firstName && sub.subscriber.lastName
                          ? `${sub.subscriber.firstName} ${sub.subscriber.lastName}`
                          : sub.subscriber.username || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{sub.subscriber.username || "user"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                    {sub.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
