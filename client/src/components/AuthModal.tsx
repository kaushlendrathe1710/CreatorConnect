// Reference: javascript_log_in_with_replit blueprint - Using Replit Auth for authentication
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const handleLogin = () => {
    // Redirect to Replit Auth login endpoint
    window.location.href = "/api/login";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Welcome to CreatorHub
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign in to start creating and earning
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-center text-muted-foreground">
            Sign in with Google, Apple, GitHub, or email
          </p>

          <Button
            className="w-full h-11"
            onClick={handleLogin}
            data-testid="button-login"
          >
            Continue to Sign In
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
