import { emailService } from "./emailService";

interface OTPRecord {
  otp: string;
  email: string;
  expiresAt: number;
  attempts: number;
}

class OTPService {
  private otpStore: Map<string, OTPRecord> = new Map();
  private readonly OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_ATTEMPTS = 5;

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    // Generate OTP
    const otp = this.generateOTP();
    const expiresAt = Date.now() + this.OTP_EXPIRY_MS;

    // Store OTP
    this.otpStore.set(email, {
      otp,
      email,
      expiresAt,
      attempts: 0,
    });

    // Send email
    const emailSent = await emailService.sendOTP(email, otp);

    if (!emailSent) {
      this.otpStore.delete(email);
      return {
        success: false,
        message: "Failed to send OTP email. Please check your SMTP configuration.",
      };
    }

    // Auto-cleanup after expiry
    setTimeout(() => {
      this.otpStore.delete(email);
    }, this.OTP_EXPIRY_MS);

    return {
      success: true,
      message: "OTP sent successfully to your email",
    };
  }

  verifyOTP(email: string, otp: string): { success: boolean; message: string } {
    const record = this.otpStore.get(email);

    if (!record) {
      return {
        success: false,
        message: "OTP not found or expired. Please request a new one.",
      };
    }

    // Check if expired
    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(email);
      return {
        success: false,
        message: "OTP has expired. Please request a new one.",
      };
    }

    // Check attempts
    if (record.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(email);
      return {
        success: false,
        message: "Maximum verification attempts exceeded. Please request a new OTP.",
      };
    }

    // Increment attempts
    record.attempts++;

    // Verify OTP
    if (record.otp !== otp) {
      return {
        success: false,
        message: `Invalid OTP. ${this.MAX_ATTEMPTS - record.attempts} attempts remaining.`,
      };
    }

    // Success - remove OTP
    this.otpStore.delete(email);
    return {
      success: true,
      message: "OTP verified successfully",
    };
  }

  resendOTP(email: string): Promise<{ success: boolean; message: string }> {
    // Delete existing OTP
    this.otpStore.delete(email);
    
    // Send new OTP
    return this.sendOTP(email);
  }
}

export const otpService = new OTPService();
