import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { updateProfileSchema } from "@/lib/validation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
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
        createdAt: true,
      },
    });

    if (!user) {
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

    // Update user in database
    const updatedUser = await prisma.user.update({
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

    // Also update Supabase user metadata for name and avatar
    if (name !== undefined || avatar !== undefined) {
      const metadataUpdate: { name?: string; full_name?: string; avatar_url?: string } = {};
      if (name !== undefined) {
        metadataUpdate.name = name;
        metadataUpdate.full_name = name;
      }
      if (avatar !== undefined) {
        metadataUpdate.avatar_url = avatar;
      }

      // Try to update Supabase metadata (only works for Supabase-authenticated users)
      try {
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

        await supabase.auth.updateUser({
          data: metadataUpdate,
        });
      } catch (supabaseError) {
        // Silently fail - user might be using JWT auth
        console.log("Could not update Supabase metadata (user may be using JWT auth)");
      }
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    
    // Handle unique constraint violations
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === "P2002") {
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
