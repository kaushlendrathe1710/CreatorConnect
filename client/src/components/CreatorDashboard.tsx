import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Eye } from "lucide-react";

const stats = [
  {
    title: "Total Subscribers",
    value: "1,234",
    icon: Users,
    change: "+12%"
  },
  {
    title: "Monthly Revenue",
    value: "$4,680",
    icon: DollarSign,
    change: "+8%"
  },
  {
    title: "Total Earnings",
    value: "$23,450",
    icon: TrendingUp,
    change: "+15%"
  },
  {
    title: "Post Views",
    value: "45.2K",
    icon: Eye,
    change: "+23%"
  }
];

export function CreatorDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Creator Dashboard</h2>
        <p className="text-muted-foreground">Track your growth and earnings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`text-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div>
                    <p className="text-sm font-medium">User {i}</p>
                    <p className="text-xs text-muted-foreground">Subscribed 2 days ago</p>
                  </div>
                </div>
                <p className="text-sm font-semibold">$9.99/mo</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
