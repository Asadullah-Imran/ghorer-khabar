import nodemailer from "nodemailer";
import { randomBytes } from "crypto";

// Configure your email transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Generate a secure verification token
 */
export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Generate token expiry time (24 hours from now)
 */
export function getTokenExpiry(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  userName?: string
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Ghorer Khabar" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify Your Email - Ghorer Khabar",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0D8ABC; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #0D8ABC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍳 Ghorer Khabar</h1>
            </div>
            <div class="content">
              <h2>Welcome${userName ? `, ${userName}` : ""}! 👋</h2>
              <p>Thank you for signing up for Ghorer Khabar!</p>
              <p>Please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                Or copy and paste this link into your browser:<br>
                <a href="${verificationUrl}">${verificationUrl}</a>
              </p>
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                This link will expire in 24 hours.
              </p>
              <p style="margin-top: 20px; font-size: 14px; color: #999;">
                If you didn't create this account, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Ghorer Khabar. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

/**
 * Send seller approval/activation email
 */
export async function sendSellerApprovalEmail(
  email: string,
  sellerName: string,
  kitchenName: string
) {
  const mailOptions = {
    from: `"Ghorer Khabar" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your kitchen is approved and active",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; }
            .container { max-width: 640px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px; border: 1px solid #e5e7eb; }
            .header { text-align: center; padding: 12px 0 4px; }
            .pill { display: inline-block; padding: 6px 12px; background: #ecfdf3; color: #16a34a; font-weight: 700; border-radius: 9999px; font-size: 12px; letter-spacing: .02em; }
            .btn { display: inline-block; padding: 12px 18px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 8px; font-weight: 700; margin-top: 12px; }
            .card { background: white; padding: 18px; border-radius: 10px; border: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Hi ${sellerName || "there"},</h2>
              <div class="pill">Approved & Active</div>
            </div>
            <p>Great news! Your kitchen <strong>${kitchenName}</strong> has been approved and activated. You can now start receiving orders.</p>
            <div class="card">
              <p style="margin:0 0 8px 0; font-weight:700;">What to do next?</p>
              <ul style="margin:0; padding-left:18px; color:#4b5563;">
                <li>Review your menu items and pricing</li>
                <li>Ensure NID and documents stay up to date</li>
                <li>Keep your kitchen availability toggled appropriately</li>
              </ul>
            </div>
            <p>If you have any questions, reply to this email and our team will help.</p>
            <p style="margin-top:16px; color:#6b7280; font-size:12px;">Thanks for partnering with Ghorer Khabar!</p>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Send seller rejection email
 */
export async function sendSellerRejectionEmail(
  email: string,
  sellerName: string,
  kitchenName: string,
  reason: string
) {
  const mailOptions = {
    from: `"Ghorer Khabar" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Application Rejected - Ghorer Khabar",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; }
            .container { max-width: 640px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px; border: 1px solid #e5e7eb; }
            .header { text-align: center; padding: 12px 0 4px; }
            .pill { display: inline-block; padding: 6px 12px; background: #fee2e2; color: #dc2626; font-weight: 700; border-radius: 9999px; font-size: 12px; letter-spacing: .02em; }
            .card { background: white; padding: 18px; border-radius: 10px; border: 1px solid #e5e7eb; margin: 16px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Hi ${sellerName || "there"},</h2>
              <div class="pill">Application Rejected</div>
            </div>
            <p>We regret to inform you that your kitchen application for <strong>${kitchenName}</strong> has been rejected.</p>
            <div class="card">
              <p style="margin:0 0 8px 0; font-weight:700;">Reason for rejection:</p>
              <p style="margin:0; color:#4b5563; padding: 12px; background: #f9fafb; border-left: 3px solid #dc2626; border-radius: 4px;">${reason}</p>
            </div>
            <p>If you believe this was a mistake or would like to reapply after addressing the concerns, please contact our support team.</p>
            <p style="margin-top:16px; color:#6b7280; font-size:12px;">Ghorer Khabar Support Team</p>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Send seller suspension email
 */
export async function sendSellerSuspensionEmail(
  email: string,
  sellerName: string,
  kitchenName: string,
  reason: string
) {
  const mailOptions = {
    from: `"Ghorer Khabar" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Account Suspended - Ghorer Khabar",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; }
            .container { max-width: 640px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px; border: 1px solid #e5e7eb; }
            .header { text-align: center; padding: 12px 0 4px; }
            .pill { display: inline-block; padding: 6px 12px; background: #fef3c7; color: #d97706; font-weight: 700; border-radius: 9999px; font-size: 12px; letter-spacing: .02em; }
            .card { background: white; padding: 18px; border-radius: 10px; border: 1px solid #e5e7eb; margin: 16px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Hi ${sellerName || "there"},</h2>
              <div class="pill">Account Suspended</div>
            </div>
            <p>Your seller account and kitchen <strong>${kitchenName}</strong> have been temporarily suspended.</p>
            <div class="card">
              <p style="margin:0 0 8px 0; font-weight:700;">Reason for suspension:</p>
              <p style="margin:0; color:#4b5563; padding: 12px; background: #f9fafb; border-left: 3px solid #d97706; border-radius: 4px;">${reason}</p>
            </div>
            <p>During this period, you will not be able to accept new orders. Please contact our support team immediately to resolve this matter and restore your account.</p>
            <p style="margin-top:16px; color:#6b7280; font-size:12px;">Ghorer Khabar Support Team</p>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate OTP expiry time (10 minutes from now)
 */
export function getOTPExpiry(): Date {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
}

/**
 * Send OTP email for password recovery
 */
export async function sendPasswordResetOTP(
  email: string,
  otp: string,
  userName?: string
) {
  const mailOptions = {
    from: `"Ghorer Khabar" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Password Reset Code - Ghorer Khabar",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #306B62; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background: white; border: 2px dashed #306B62; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
            .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #306B62; font-family: monospace; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍳 Ghorer Khabar</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hi${userName ? ` ${userName}` : ""},</p>
              <p>We received a request to reset your password. Use the verification code below to proceed:</p>
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</p>
                <div class="otp-code">${otp}</div>
              </div>
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                This code will expire in <strong>10 minutes</strong>.
              </p>
              <p style="margin-top: 20px; font-size: 14px; color: #999;">
                If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Ghorer Khabar. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset OTP sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending password reset OTP:", error);
    throw new Error("Failed to send password reset OTP");
  }
}

/**
 * Send password reset email (legacy - with token link)
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  userName?: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Ghorer Khabar" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset Your Password - Ghorer Khabar",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0D8ABC; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #0D8ABC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍳 Ghorer Khabar</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hi${userName ? ` ${userName}` : ""},</p>
              <p>We received a request to reset your password. Click the button below to set a new password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetUrl}">${resetUrl}</a>
              </p>
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                This link will expire in 24 hours.
              </p>
              <p style="margin-top: 20px; font-size: 14px; color: #999;">
                If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Ghorer Khabar. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}
