import { prisma } from "@/lib/prisma/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/auth/set-role:
 *   post:
 *     summary: Sets the role for the authenticated user
 *     description: Allows a logged-in user to set their role to 'BUYER' or 'SELLER'. Requires authentication.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [BUYER, SELLER]
 *                 example: SELLER
 *     responses:
 *       200:
 *         description: Role updated successfully.
 *       401:
 *         description: Unauthorized, user not logged in.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 *
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: ghorer-khabar-auth
 */

export async function POST(req: Request) {
  try {
    const { roleName } = await req.json(); // "BUYER" or "SELLER"

    // 1. Get current user from Supabase
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Update the user's role directly on the User table
    await prisma.user.update({
      where: { id: user.id },
      data: { role: roleName },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
