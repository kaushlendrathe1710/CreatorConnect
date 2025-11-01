import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY");
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
  price: number;
  creatorId?: string;
}

function SubscribeForm({ creatorName, price, onSuccess }: { creatorName: string; price: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/feed`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Invalidate all relevant queries to refresh subscription status
        await queryClient.invalidateQueries({ queryKey: ["/api/users"] });
        await queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
        await queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
        
        toast({
          title: "Subscription Successful",
          description: `You're now subscribed to ${creatorName}!`,
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || isSubmitting}
        data-testid="button-confirm-subscribe"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Subscribe for $${(price / 100).toFixed(2)}/month`
        )}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        You'll be charged ${(price / 100).toFixed(2)} today. Subscription auto-renews monthly.
      </p>
    </form>
  );
}

export function SubscriptionModal({
  isOpen,
  onClose,
  creatorName,
  price,
  creatorId,
}: SubscriptionModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && creatorId) {
      setIsLoading(true);
      apiRequest("POST", "/api/create-subscription", { creatorId })
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            throw new Error("No client secret returned");
          }
        })
        .catch((error) => {
          console.error("Error creating subscription:", error);
          toast({
            title: "Error",
            description: "Failed to initiate subscription. Please try again.",
            variant: "destructive",
          });
          onClose();
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, creatorId, onClose, toast]);

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
            <div className="text-3xl font-bold">${(price / 100).toFixed(2)}/month</div>
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

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SubscribeForm creatorName={creatorName} price={price} onSuccess={onClose} />
            </Elements>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Unable to load payment form
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
