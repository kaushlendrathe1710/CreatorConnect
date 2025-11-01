import { Lock, TrendingUp, Users, CreditCard, MessageCircle, BarChart3, Shield, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const creatorFeatures = [
  {
    icon: Lock,
    title: "Exclusive Content Control",
    description: "Choose what's public and what's for subscribers only"
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track subscribers, revenue, and engagement metrics"
  },
  {
    icon: CreditCard,
    title: "Automatic Payments",
    description: "Get paid monthly with secure Stripe integration"
  },
  {
    icon: Users,
    title: "Community Building",
    description: "Grow and engage with your loyal subscriber base"
  }
];

const userFeatures = [
  {
    icon: Zap,
    title: "Discover Amazing Creators",
    description: "Explore trending content and find creators you love"
  },
  {
    icon: Lock,
    title: "Premium Content Access",
    description: "Unlock exclusive posts from your favorite creators"
  },
  {
    icon: MessageCircle,
    title: "Direct Engagement",
    description: "Like, comment, and interact with creators"
  },
  {
    icon: Shield,
    title: "Secure Subscriptions",
    description: "Safe payments with flexible cancellation anytime"
  }
];

export function FeatureShowcase() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Built for Everyone</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're creating or discovering, we've got you covered
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
              <p className="text-sm font-semibold text-primary">For Creators</p>
            </div>
            <h3 className="text-3xl font-bold mb-8">
              Build Your Business
            </h3>
            <div className="space-y-4">
              {creatorFeatures.map((feature, index) => (
                <Card key={index} className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold mb-1">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
              <p className="text-sm font-semibold text-primary">For Fans</p>
            </div>
            <h3 className="text-3xl font-bold mb-8">
              Support Your Favorites
            </h3>
            <div className="space-y-4">
              {userFeatures.map((feature, index) => (
                <Card key={index} className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold mb-1">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
