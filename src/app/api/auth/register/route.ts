import { NextResponse } from "next/server";
import { registerWithEmail } from "@/services/authService";
import "dotenv/config";

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registers a new user
 *     description: Takes user details, sends a verification OTP to the user's email. Does not create the user yet.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: strongpassword123
 *               role:
 *                 type: string
 *                 enum: [BUYER, SELLER]
 *                 example: BUYER
 *     responses:
 *       200:
 *         description: OTP sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification code sent to your email.
 *       400:
 *         description: User already exists or invalid input.
 *       500:
 *         description: Failed to send email.
 */

export async function POST(req: Request) {
  try {
    const { email, password, name, role } = await req.json();

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRole = role === "SELLER" || role === "ADMIN" ? role : "BUYER";

    // Register user with email verification
    const result = await registerWithEmail(email, password, name, validRole);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 400 }
    );
  }
}
