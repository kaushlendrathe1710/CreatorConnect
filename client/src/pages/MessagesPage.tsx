import { InstagramLayout } from "@/components/InstagramLayout";
import { MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function MessagesPage() {
  return (
    <InstagramLayout>
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">Messages</h2>
        
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your Messages</h3>
            <p className="text-muted-foreground mb-4">
              Send private messages to creators and subscribers
            </p>
            <p className="text-sm text-muted-foreground">
              Messaging feature coming soon!
            </p>
          </CardContent>
        </Card>
      </div>
    </InstagramLayout>
  );
}
