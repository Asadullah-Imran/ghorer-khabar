/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verifies OTP for user registration or password recovery
 *     description: |
 *       This endpoint handles two scenarios based on the `type` field:
 *       1. `signup` or `email`: Verifies the OTP and creates a new user in the database (Supabase OTP).
 *       2. `recovery`: Verifies the OTP and, if a new password is provided, updates the user's password (Custom OTP).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               type:
 *                 type: string
 *                 enum: [signup, recovery, email]
 *                 example: signup
 *               name:
 *                 type: string
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 example: strongpassword123
 *               role:
 *                 type: string
 *                 enum: [BUYER, SELLER]
 *                 example: BUYER
 *     responses:
 *       200:
 *         description: OTP verified successfully. User created or password updated.
 *       400:
 *         description: Invalid OTP, user not found, or other error.
 *       500:
 *         description: Internal server error.
 */

import { hashPassword } from "@/lib/auth/hash";
import { prisma } from "@/lib/prisma/prisma";
import { resetPasswordWithOTP, verifyPasswordResetOTP } from "@/services/authService";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, otp, name, password, type, role } = await req.json();
    
    console.log(
      "Received OTP verification request for email:",
      email,
      "type:",
      type
    );

    // Handle password recovery with custom OTP system
    if (type === "recovery") {
      // Step 1: Just verify OTP (no password provided yet)
      if (!password) {
        try {
          const result = await verifyPasswordResetOTP(email, otp);
          return NextResponse.json({
            success: true,
            message: "OTP verified. Please enter your new password.",
            userId: result.userId,
          });
        } catch (error: any) {
          console.error("OTP verification error:", error);
          return NextResponse.json(
            { error: error.message || "Invalid or expired OTP" },
            { status: 400 }
          );
        }
      }

      // Step 2: Reset password (password provided)
      try {
        const result = await resetPasswordWithOTP(email, otp, password);
        return NextResponse.json({
          success: true,
          message: "Password reset successful. You can now login with your new password.",
          userId: result.userId,
        });
      } catch (error: any) {
        console.error("Password reset error:", error);
        return NextResponse.json(
          { error: error.message || "Invalid or expired OTP" },
          { status: 400 }
        );
      }
    }

    // Handle registration with Supabase OTP
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    // Verify OTP with Supabase (for registration)
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error || !data.user) {
      console.error("Supabase Auth Error:", error?.message);
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Normalize role; default BUYER
    const normalizedRole =
      (role || "BUYER").toString().toUpperCase() === "SELLER"
        ? "SELLER"
        : "BUYER";

    // Create user in database
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        ...(name && { name }),
        role: normalizedRole,
      },
      create: {
        id: data.user.id,
        email,
        name: name || "New User",
        password: hashedPassword,
        role: normalizedRole,
        authProvider: "EMAIL",
        emailVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registration complete",
      user,
    });
  } catch (err: any) {
    console.error("Verification Route Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
