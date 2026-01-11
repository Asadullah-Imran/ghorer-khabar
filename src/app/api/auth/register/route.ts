import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import { NextResponse } from "next/server";

// Use Service Role Key for administrative tasks (sending OTP)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    const { email } = await req.json();

    // 1. Check if user already exists in your Prisma database
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // 2. Request Supabase to send OTP email
    //This will create a "pending" user in Supabase Auth
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // Creates user in Supabase Auth immediately
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Verification code sent to email" });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
