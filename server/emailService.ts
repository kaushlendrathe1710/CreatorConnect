import nodemailer from "nodemailer";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (!host || !port || !user || !pass) {
      console.warn("SMTP credentials not configured. Email service disabled.");
      return;
    }

    const config: EmailConfig = {
      host,
      port: parseInt(port),
      secure: port === "465", // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    };

    this.transporter = nodemailer.createTransport(config);
  }

  async sendOTP(email: string, otp: string): Promise<boolean> {
    if (!this.transporter) {
      console.error("Email transporter not initialized");
      return false;
    }

    try {
      const mailOptions = {
        from: `"CreatorHub" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your CreatorHub Login Code",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .container {
                  background: #f9f9f9;
                  border-radius: 10px;
                  padding: 30px;
                  text-align: center;
                }
                .logo {
                  font-size: 28px;
                  font-weight: bold;
                  color: #000;
                  margin-bottom: 20px;
                }
                .otp-code {
                  background: white;
                  border: 2px solid #e0e0e0;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 30px 0;
                  font-size: 36px;
                  font-weight: bold;
                  letter-spacing: 8px;
                  color: #000;
                }
                .message {
                  color: #666;
                  margin: 20px 0;
                }
                .footer {
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #e0e0e0;
                  color: #999;
                  font-size: 14px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">CreatorHub</div>
                <h1>Your Login Code</h1>
                <p class="message">Enter this code to complete your login:</p>
                <div class="otp-code">${otp}</div>
                <p class="message">This code will expire in 10 minutes.</p>
                <p class="message">If you didn't request this code, please ignore this email.</p>
                <div class="footer">
                  <p>CreatorHub - Create. Share. Earn.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `Your CreatorHub login code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log("SMTP connection verified successfully");
      return true;
    } catch (error) {
      console.error("SMTP connection verification failed:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();
