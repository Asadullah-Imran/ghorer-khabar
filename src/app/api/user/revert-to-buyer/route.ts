import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";

/**
 * POST /api/user/revert-to-buyer
 * Revert user role from SELLER back to BUYER
 * This is used when a user cancels the chef onboarding process
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
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is a seller
    if (user.role !== "SELLER") {
      return NextResponse.json(
        { error: "User is not a seller" },
        { status: 400 }
      );
    }

    // Check if user has completed onboarding (has a kitchen)
    const kitchen = await prisma.kitchen.findFirst({
      where: { sellerId: userId },
      select: { id: true, onboardingCompleted: true },
    });

    // If kitchen exists and onboarding is completed, don't allow revert
    if (kitchen && kitchen.onboardingCompleted) {
      return NextResponse.json(
        { error: "Cannot revert role after completing onboarding" },
        { status: 400 }
      );
    }

    // Delete kitchen if it exists (incomplete onboarding)
    if (kitchen) {
      await prisma.kitchen.delete({
        where: { id: kitchen.id },
      });
    }

    // Update user role back to BUYER
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: "BUYER" },
      select: {
        id: true,
        role: true,
      },
    });

    console.log(`User ${userId} reverted to BUYER role`);

    return NextResponse.json({
      success: true,
      message: "Successfully reverted to buyer",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error reverting user to buyer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
