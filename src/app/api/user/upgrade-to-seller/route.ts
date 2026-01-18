import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/user/upgrade-to-seller:
 *   post:
 *     summary: Upgrade user role from BUYER to SELLER
 *     description: Allows a buyer to upgrade their account to a seller account
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully upgraded to seller
 *       400:
 *         description: User is already a seller
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST() {
  try {
    // Get authenticated user ID
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user to check role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already a seller
    if (user.role === "SELLER") {
      return NextResponse.json(
        { error: "User is already a seller" },
        { status: 400 }
      );
    }

    // Update user role to SELLER
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: "SELLER" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log(`User ${userId} upgraded to SELLER role`);

    return NextResponse.json({
      success: true,
      message: "Successfully upgraded to seller",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error upgrading user to seller:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
