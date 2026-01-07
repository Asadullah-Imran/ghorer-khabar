import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { updatePasswordSchema } from "@/lib/validation";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/user/password:
 *   put:
 *     summary: Update user password
 *     description: Changes the password for the authenticated user
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: oldpassword123
 *               newPassword:
 *                 type: string
 *                 example: newpassword123
 *               confirmPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Validation error or incorrect current password
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function PUT(req: NextRequest) {
  try {
    // Get authenticated user ID (supports both Supabase and JWT)
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = updatePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        authProvider: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user uses email/password authentication
    if (user.authProvider !== "EMAIL") {
      return NextResponse.json(
        {
          error:
            "Password update not available for OAuth users. Please use your OAuth provider to manage your password.",
        },
        { status: 400 }
      );
    }

    // Verify current password
    if (!user.password) {
      return NextResponse.json(
        { error: "No password set for this account" },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Also update Supabase auth password if using Supabase auth
    try {
      const supabase = await createClient();

      await supabase.auth.updateUser({
        password: newPassword,
      });
    } catch (supabaseError) {
      console.warn(
        "Could not update Supabase password (user may be using JWT auth):",
        supabaseError
      );
      // Continue anyway as we've updated the database
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
