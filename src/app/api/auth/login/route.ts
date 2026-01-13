import { loginSchema } from "@/lib/validation";
import { loginUser } from "@/services/auth.service";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Logs in a user
 *     description: Authenticates a user with email and password and returns a JWT in an httpOnly cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: foodie@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful. Redirects to the feed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *       401:
 *         description: Invalid credentials.
 *       500:
 *         description: Internal server error.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Login attempt with body:", body);

    // Validate input with Zod
    const data = loginSchema.parse(body);

    // Call login service to verify credentials in Prisma database
    const { user, token } = await loginUser(data);

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before logging in" },
        { status: 403 }
      );
    }

    // Set JWT cookie for email/password authentication
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    console.log("User logged in successfully:", user);

    return NextResponse.json(
      {
        message: "Login successful",
        user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 401 }
    );
  }
}
