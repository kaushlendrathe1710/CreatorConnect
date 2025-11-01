import { useState } from "react";
import { SubscriptionModal } from "../SubscriptionModal";
import { Button } from "@/components/ui/button";

export default function SubscriptionModalExample() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="p-4">
      <Button onClick={() => setIsOpen(true)}>Open Subscription Modal</Button>
      <SubscriptionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        creatorName="Sarah Creates"
        price={9.99}
      />
    </div>
  );
}
