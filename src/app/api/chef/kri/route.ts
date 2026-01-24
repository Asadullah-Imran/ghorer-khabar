/**
 * KRI (Kitchen Reliability Index) API
 * 
 * GET /api/chef/kri - Get current KRI score and breakdown
 * POST /api/chef/kri - Calculate and update KRI score
 */

import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { calculateKRI, updateKRIScore } from "@/lib/services/kriCalculation";

/**
 * Helper function to authenticate user
 */
async function authenticateUser(): Promise<string | null> {
  let userId: string | undefined;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (user && !authError) {
    userId = user.id;
  } else {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && typeof decoded === "object" && "userId" in decoded) {
        userId = decoded.userId as string;
      }
    }
  }

  return userId || null;
}

/**
 * GET /api/chef/kri
 * Get current KRI score and detailed breakdown
 */
export async function GET() {
  try {
    const userId = await authenticateUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a seller
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user || user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Only sellers can access KRI data" },
        { status: 403 }
      );
    }

    // Get kitchen
    const kitchen = await prisma.kitchen.findFirst({
      where: { sellerId: userId },
      select: { id: true },
    });

    if (!kitchen) {
      return NextResponse.json(
        { error: "Kitchen not found. Please complete onboarding first." },
        { status: 404 }
      );
    }

    // Calculate KRI
    const kriResult = await calculateKRI(kitchen.id);

    return NextResponse.json({
      success: true,
      data: kriResult,
    });
  } catch (error) {
    console.error("Error calculating KRI:", error);
    return NextResponse.json(
      { error: "Failed to calculate KRI" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chef/kri
 * Calculate and update KRI score in the database
 */
export async function POST() {
  try {
    const userId = await authenticateUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a seller
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user || user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Only sellers can update KRI" },
        { status: 403 }
      );
    }

    // Get kitchen
    const kitchen = await prisma.kitchen.findFirst({
      where: { sellerId: userId },
      select: { id: true },
    });

    if (!kitchen) {
      return NextResponse.json(
        { error: "Kitchen not found. Please complete onboarding first." },
        { status: 404 }
      );
    }

    // Calculate and update KRI
    const newKriScore = await updateKRIScore(kitchen.id);
    const kriResult = await calculateKRI(kitchen.id);

    return NextResponse.json({
      success: true,
      message: "KRI score updated successfully",
      data: {
        kriScore: newKriScore,
        breakdown: kriResult.breakdown,
        metrics: kriResult.metrics,
      },
    });
  } catch (error) {
    console.error("Error updating KRI:", error);
    return NextResponse.json(
      { error: "Failed to update KRI" },
      { status: 500 }
    );
  }
}
