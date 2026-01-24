import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { calculatePlatformRevenue } from "@/lib/services/revenueCalculation";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/revenue
 * Calculate platform revenue from completed orders (Admin only)
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
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

    // Calculate total platform revenue
    const totalRevenue = await calculatePlatformRevenue(startDate, endDate);

    // Get order count for context
    const orderCount = await prisma.order.count({
      where: {
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

    // Calculate revenue breakdown by source
    const orders = await prisma.order.findMany({
      where: {
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
      include: {
        items: true,
      },
    });

    let revenueFromOrders = 0; // platform-side revenue from non-subscription orders
    let revenueFromSubscriptions = 0; // platform-side revenue from subscription orders
    let totalDeliveryFees = 0; // informational only; goes to chefs per guide
    let totalPlatformFees = 0;

    for (const order of orders) {
      const itemsTotal = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const platformFee = 0;
      const deliveryFee = order.total - itemsTotal - platformFee;
      const commission = itemsTotal * 0.10; // 10% commission per sale (completed orders)

      totalDeliveryFees += deliveryFee;
      totalPlatformFees += platformFee;

      const platformRevenue = platformFee + commission;
      if (order.subscription_id) {
        revenueFromSubscriptions += platformRevenue;
      } else {
        revenueFromOrders += platformRevenue;
      }
    }

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

      const monthRevenue = await calculatePlatformRevenue(monthStart, monthEnd);

      monthlyBreakdown.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        revenue: Math.round(monthRevenue),
      });
    }

    // Get top earning kitchens (by order count, not revenue - for reference)
    const topKitchens = await prisma.order.groupBy({
      by: ["kitchenId"],
      where: {
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
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    const topKitchensWithNames = await Promise.all(
      topKitchens.map(async (kitchen) => {
        const kitchenData = await prisma.kitchen.findUnique({
          where: { id: kitchen.kitchenId },
          select: { name: true },
        });
        return {
          kitchenId: kitchen.kitchenId,
          kitchenName: kitchenData?.name || "Unknown",
          orderCount: kitchen._count.id,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue),
        orderCount,
        breakdown: {
          fromOrders: Math.round(revenueFromOrders),
          fromSubscriptions: Math.round(revenueFromSubscriptions),
          deliveryFees: Math.round(totalDeliveryFees),
          platformFees: Math.round(totalPlatformFees),
        },
        period: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          type: period,
        },
        monthlyBreakdown,
        topKitchens: topKitchensWithNames,
      },
    });
  } catch (error) {
    console.error("Error calculating platform revenue:", error);
    return NextResponse.json(
      { error: "Failed to calculate revenue" },
      { status: 500 }
    );
  }
}
