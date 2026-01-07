import { prisma } from "@/lib/prisma/prisma";
import { hashPassword } from "@/lib/auth/hash";
import {
  generateVerificationToken,
  getTokenExpiry,
  sendVerificationEmail,
  generateOTP,
  getOTPExpiry,
  sendPasswordResetOTP,
} from "@/lib/email/emailService";

/**
 * Register user with email and password
 * Creates unverified user and sends verification email
 */
export async function registerWithEmail(
  email: string,
  password: string,
  name: string,
  role: "BUYER" | "SELLER" | "ADMIN" = "BUYER"
) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.emailVerified) {
        throw new Error("User already exists with this email");
      } else {
        // User exists but not verified, resend verification
        const token = generateVerificationToken();
        const expiry = getTokenExpiry();

        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            verificationToken: token,
            verificationExpiry: expiry,
          },
        });

        await sendVerificationEmail(email, token, name);
        return {
          message: "Verification email resent",
          userId: existingUser.id,
        };
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpiry = getTokenExpiry();

    // Create user
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
        name,
        role,
        authProvider: "EMAIL",
        emailVerified: false,
        verificationToken,
        verificationExpiry,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken, name);

    return {
      message:
        "Registration successful. Please check your email to verify your account.",
      userId: user.id,
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new Error("Invalid verification token");
    }

    if (user.emailVerified) {
      return {
        message: "Email already verified",
        alreadyVerified: true,
        userId: user.id,
        email: user.email,
      };
    }

    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      throw new Error("Verification token has expired");
    }

    // Update user - mark as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    return {
      message: "Email verified successfully",
      userId: user.id,
      email: user.email,
    };
  } catch (error) {
    console.error("Email verification error:", error);
    throw error;
  }
}

/**
 * Register or login user via OAuth (Google)
 */
export async function handleOAuthUser(
  email: string,
  name: string,
  providerId: string,
  avatar?: string,
  role: "BUYER" | "SELLER" | "ADMIN" = "BUYER"
) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update OAuth info if needed
      if (existingUser.authProvider === "EMAIL") {
        // User signed up with email, now logging in with Google
        // Link the accounts
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            providerId,
            avatar: avatar || existingUser.avatar,
            name: name || existingUser.name,
          },
        });
      }
      return existingUser;
    }

    // Create new OAuth user (already verified)
    const user = await prisma.user.create({
      data: {
        id: providerId, // Use Google ID as user ID
        email,
        name,
        role,
        authProvider: "GOOGLE",
        providerId,
        avatar,
        emailVerified: true, // OAuth users are pre-verified
        password: null, // No password for OAuth users
      },
    });

    return user;
  } catch (error) {
    console.error("OAuth user handling error:", error);
    throw error;
  }
}

/**
 * Clean up expired verification tokens (run as cron job)
 */
export async function cleanupExpiredTokens() {
  try {
    const result = await prisma.user.updateMany({
      where: {
        verificationExpiry: {
          lt: new Date(),
        },
        emailVerified: false,
      },
      data: {
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    console.log(`Cleaned up ${result.count} expired verification tokens`);
    return result.count;
  } catch (error) {
    console.error("Token cleanup error:", error);
    throw error;
  }
}


/**
 * Initiate password reset - Send OTP to user's email
 */
export async function initiatePasswordReset(email: string) {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found with this email");
    }

    // Only allow password reset for email-based users
    if (user.authProvider !== "EMAIL") {
      throw new Error(
        "Password reset is only available for email-based accounts. Please use Google Sign-In instead."
      );
    }

    // Generate OTP and expiry
    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    // Store OTP in database
    await prisma.emailLogOTP.create({
      data: {
        otp,
        userId: user.id,
        expiresAt,
      },
    });

    // Send OTP email
    await sendPasswordResetOTP(email, otp, user.name || undefined);

    return {
      message: "Password reset code sent to your email",
      email,
    };
  } catch (error) {
    console.error("Password reset initiation error:", error);
    throw error;
  }
}

/**
 * Verify OTP for password reset
 */
export async function verifyPasswordResetOTP(email: string, otp: string) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        EmailLogOTPs: {
          where: {
            otp,
            expiresAt: {
              gt: new Date(), // Not expired
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.EmailLogOTPs.length === 0) {
      throw new Error("Invalid or expired OTP");
    }

    return {
      success: true,
      userId: user.id,
      email: user.email,
    };
  } catch (error) {
    console.error("OTP verification error:", error);
    throw error;
  }
}

/**
 * Reset password with verified OTP
 */
export async function resetPasswordWithOTP(
  email: string,
  otp: string,
  newPassword: string
) {
  try {
    // Verify OTP first
    await verifyPasswordResetOTP(email, otp);

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    const user = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    // Delete all OTPs for this user (cleanup)
    await prisma.emailLogOTP.deleteMany({
      where: {
        userId: user.id,
      },
    });

    return {
      message: "Password reset successful",
      userId: user.id,
    };
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
}

/**
 * Clean up expired OTPs (run as cron job)
 */
export async function cleanupExpiredOTPs() {
  try {
    const result = await prisma.emailLogOTP.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`Cleaned up ${result.count} expired OTPs`);
    return result.count;
  } catch (error) {
    console.error("OTP cleanup error:", error);
    throw error;
  }
}
