import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { calculateChefRevenue } from "@/lib/services/revenueCalculation";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/chef/revenue
 * Calculate chef revenue from completed orders
 * 
 * Query params:
 * - startDate (optional): ISO date string
 * - endDate (optional): ISO date string
 * - period (optional): "daily" | "weekly" | "monthly"
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get chef's kitchen
    const kitchen = await prisma.kitchen.findFirst({
      where: { sellerId: userId },
      select: { id: true, name: true },
    });

    if (!kitchen) {
      return NextResponse.json(
        { error: "Kitchen not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const period = searchParams.get("period") || "all";

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateParam) {
      startDate = new Date(startDateParam);
    }
    if (endDateParam) {
      endDate = new Date(endDateParam);
    }

    // If period is specified, calculate date range
    if (period !== "all" && !startDateParam && !endDateParam) {
      const now = new Date();
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      switch (period) {
        case "daily":
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "weekly":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "monthly":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          startDate.setHours(0, 0, 0, 0);
          break;
      }
    }

    // Calculate total chef revenue
    const totalRevenue = await calculateChefRevenue(
      kitchen.id,
      startDate,
      endDate
    );

    // Get order count for context
    const orderCount = await prisma.order.count({
      where: {
        kitchenId: kitchen.id,
        status: "COMPLETED",
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      },
    });

    // Calculate monthly breakdown (last 12 months)
    const monthlyBreakdown = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setHours(0, 0, 0, 0);

      const monthRevenue = await calculateChefRevenue(
        kitchen.id,
        monthStart,
        monthEnd
      );

      monthlyBreakdown.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        revenue: Math.round(monthRevenue),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        kitchenId: kitchen.id,
        kitchenName: kitchen.name,
        totalRevenue: Math.round(totalRevenue),
        orderCount,
        period: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          type: period,
        },
        monthlyBreakdown,
      },
    });
  } catch (error) {
    console.error("Error calculating chef revenue:", error);
    return NextResponse.json(
      { error: "Failed to calculate revenue" },
      { status: 500 }
    );
  }
}
