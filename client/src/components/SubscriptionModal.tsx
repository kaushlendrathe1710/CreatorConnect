import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
  price: number;
  creatorId?: string;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  creatorName,
  price,
  creatorId,
}: SubscriptionModalProps) {
  const handleSubscribe = () => {
    // TODO: Implement subscription flow with Stripe
    console.log("Subscribe to", creatorName, creatorId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Subscribe to {creatorName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-muted/50 p-4 rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Monthly Subscription</span>
              <Badge variant="secondary">Auto-renew</Badge>
            </div>
            <div className="text-3xl font-bold">${price}/month</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Access to all subscriber-only posts</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Support your favorite creator</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card">Card Information</Label>
              <Input
                id="card"
                placeholder="4242 4242 4242 4242"
                data-testid="input-card"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Input id="expiry" placeholder="MM/YY" data-testid="input-expiry" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" data-testid="input-cvc" />
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleSubscribe}
            data-testid="button-confirm-subscribe"
          >
            Subscribe for ${price}/month
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You'll be charged ${price} today. Subscription auto-renews monthly.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
