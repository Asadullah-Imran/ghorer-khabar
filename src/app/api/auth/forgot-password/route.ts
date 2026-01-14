import { initiatePasswordReset } from "@/services/authService";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Sends a password reset OTP
 *     description: Takes a user's email, generates a recovery OTP, and sends it via email.
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
 *     responses:
 *       200:
 *         description: Recovery code sent successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Failed to send email.
 */

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Initiate password reset - sends OTP
    const result = await initiatePasswordReset(email);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Forgot password error:", error);

    // Handle specific error messages
    if (error.message === "User not found with this email") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error.message?.includes("Password reset is only available for email")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to send reset code" },
      { status: 500 }
    );
  }
}
