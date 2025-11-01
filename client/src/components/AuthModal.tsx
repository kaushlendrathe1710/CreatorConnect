import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiGoogle, SiApple } from "react-icons/si";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const handleSendOtp = () => {
    console.log("Send OTP to:", email);
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    console.log("Verify OTP:", otp);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {otpSent ? "Enter Verification Code" : "Welcome to CreatorHub"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!otpSent ? (
            <>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-11"
                  data-testid="button-google-login"
                  onClick={() => console.log("Google login")}
                >
                  <SiGoogle className="w-5 h-5 mr-2" />
                  Continue with Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11"
                  data-testid="button-apple-login"
                  onClick={() => console.log("Apple login")}
                >
                  <SiApple className="w-5 h-5 mr-2" />
                  Continue with Apple
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSendOtp}
                disabled={!email}
                data-testid="button-send-otp"
              >
                Send Verification Code
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center">
                We sent a code to {email}
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  data-testid="input-otp"
                />
              </div>

              <Button
                className="w-full"
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6}
                data-testid="button-verify-otp"
              >
                Verify & Continue
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setOtpSent(false)}
                data-testid="button-back"
              >
                Back
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
