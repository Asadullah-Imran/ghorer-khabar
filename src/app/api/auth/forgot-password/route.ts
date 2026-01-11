import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // 1. Check if user exists in Prisma
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // 2. Request Supabase to send a Recovery OTP
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ message: "Reset code sent" });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
