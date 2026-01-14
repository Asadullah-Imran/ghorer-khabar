import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { updateProfileSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieves the profile information for the authenticated user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    // Get authenticated user ID (supports both Supabase and JWT)
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        emailVerified: true,
        authProvider: true,
        createdAt: true,
      },
    });

    if (!user) {
      // Self-healing: Check if this is a Supabase user and sync to Prisma
      try {
        const supabase = await createClient();
        const {
          data: { user: supabaseUser },
          error,
        } = await supabase.auth.getUser();

        if (supabaseUser && supabaseUser.id === userId) {
          console.log(
            "Self-healing: Recreating missing Prisma user for",
            userId
          );

          const newUser = await prisma.user.create({
            data: {
              id: userId,
              email: supabaseUser.email!,
              name:
                supabaseUser.user_metadata.full_name ||
                supabaseUser.user_metadata.name ||
                "",
              avatar:
                supabaseUser.user_metadata.avatar_url ||
                supabaseUser.user_metadata.picture,
              authProvider: "GOOGLE", // Assuming Supabase users are mostly OAuth.
              // Note: If using email/password via Supabase, this might be inaccurate but safer than crashing.
              role: (supabaseUser.user_metadata.role as any) || "BUYER",
              emailVerified: true,
            },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
              role: true,
              emailVerified: true,
              authProvider: true,
              createdAt: true,
            },
          });

          return NextResponse.json({ user: newUser });
        }
      } catch (syncError) {
        console.error("Self-healing failed:", syncError);
      }

      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update user profile
 *     description: Updates the profile information for the authenticated user
 *     security:
 *       - cookieAuth: []
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
 *               phone:
 *                 type: string
 *                 example: +8801712345678
 *               avatar:
 *                 type: string
 *                 example: https://example.com/avatar.jpg
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
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
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, phone, avatar } = validation.data;

    // Build update data (only include fields that are provided)
    const updateData: { name?: string; phone?: string; avatar?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;

    console.log("Updating profile for userId:", userId);

    // Update user in database
    let updatedUser;
    try {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          emailVerified: true,
        },
      });
    } catch (e: any) {
      if (e.code === "P2025") {
        console.error("User not found in database:", userId);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      throw e;
    }

    // Note: We don't update Supabase user metadata here because:
    // 1. It can trigger auth state changes that cause unwanted logouts
    // 2. All user data is already stored in Prisma database
    // 3. The profile is fetched from the database, not from Supabase metadata

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);

    // Handle unique constraint violations
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Phone number already in use" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
