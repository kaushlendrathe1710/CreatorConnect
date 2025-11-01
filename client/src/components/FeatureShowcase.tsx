import { Lock, TrendingUp, Users, CreditCard } from "lucide-react";
import phoneImage from "@assets/generated_images/Phone_showing_app_interface_a8c5bdea.png";

const features = [
  {
    icon: Lock,
    title: "Exclusive Content",
    description: "Share subscriber-only posts and build a premium community"
  },
  {
    icon: TrendingUp,
    title: "Analytics Dashboard",
    description: "Track your growth, earnings, and engagement in real-time"
  },
  {
    icon: Users,
    title: "Fan Engagement",
    description: "Connect directly with your supporters through comments and likes"
  },
  {
    icon: CreditCard,
    title: "Easy Payments",
    description: "Secure monthly subscriptions with automatic billing"
  }
];

export function FeatureShowcase() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src={phoneImage}
              alt="App interface preview"
              className="rounded-lg w-full"
            />
          </div>
          
          <div>
            <h2 className="text-4xl font-bold mb-6">Everything You Need</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Powerful features designed to help creators succeed
            </p>
            
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
