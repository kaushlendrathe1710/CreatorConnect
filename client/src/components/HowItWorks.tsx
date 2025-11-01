import { UserPlus, Upload, DollarSign, Heart, Search, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const creatorSteps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your account and enable creator mode instantly"
  },
  {
    icon: Upload,
    title: "Share Content",
    description: "Post exclusive content for your subscribers with visibility controls"
  },
  {
    icon: DollarSign,
    title: "Get Paid",
    description: "Earn monthly income from subscriptions with transparent analytics"
  }
];

const userSteps = [
  {
    icon: Search,
    title: "Discover",
    description: "Find and follow your favorite creators and explore trending content"
  },
  {
    icon: Heart,
    title: "Subscribe",
    description: "Support creators with monthly subscriptions starting at $5/month"
  },
  {
    icon: Lock,
    title: "Access Exclusive Content",
    description: "Enjoy subscriber-only posts, behind-the-scenes, and premium content"
  }
];

export function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're a creator or a fan, getting started is simple
          </p>
        </div>
        
        <Tabs defaultValue="creators" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="creators" data-testid="tab-creators">
              For Creators
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">
              For Fans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="creators">
            <div className="grid md:grid-cols-3 gap-8">
              {creatorSteps.map((step, index) => (
                <Card key={index} className="hover-elevate">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-4">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="grid md:grid-cols-3 gap-8">
              {userSteps.map((step, index) => (
                <Card key={index} className="hover-elevate">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-4">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
