import { setAuthCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation";
import { loginUser } from "@/services/auth.service";
import { NextResponse } from "next/server";

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

    // Call login service
    const { user, token } = await loginUser(data);

    // FIX: Must await this in Next.js 15/16
    await setAuthCookie(token);
    console.log("User logged in:", user);

    return NextResponse.json(
      {
        message: "Login successful",
        user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    // If Zod or the Service throws an error, return 401
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 401 }
    );
  }
}
