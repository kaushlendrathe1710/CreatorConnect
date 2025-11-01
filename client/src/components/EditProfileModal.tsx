import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: user.username || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    bio: user.bio || "",
    isCreator: user.isCreator,
    subscriptionPrice: user.subscriptionPrice ? (user.subscriptionPrice / 100).toFixed(2) : "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        subscriptionPrice: data.subscriptionPrice ? Math.round(parseFloat(data.subscriptionPrice) * 100) : null,
      };
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update profile");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user.username] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="yourusername"
              data-testid="input-username"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                data-testid="input-firstname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                data-testid="input-lastname"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={3}
              data-testid="input-bio"
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="creator-mode">Creator Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable to accept subscriptions
              </p>
            </div>
            <Switch
              id="creator-mode"
              checked={formData.isCreator}
              onCheckedChange={(checked) => setFormData({ ...formData, isCreator: checked })}
              data-testid="switch-creator-mode"
            />
          </div>

          {formData.isCreator && (
            <div className="space-y-2">
              <Label htmlFor="subscriptionPrice">Subscription Price (USD/month)</Label>
              <Input
                id="subscriptionPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.subscriptionPrice}
                onChange={(e) => setFormData({ ...formData, subscriptionPrice: e.target.value })}
                placeholder="9.99"
                data-testid="input-subscription-price"
              />
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateProfileMutation.isPending}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              data-testid="button-save"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
