import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get overall statistics
    const [totalUsers, totalSellers, totalOrders, totalRevenue, pendingOnboarding] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "SELLER" } }),
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: { total: true },
        }),
        prisma.kitchen.count({ where: { onboardingCompleted: false } }),
      ]);

    // Get order status breakdown
    const orderStatusBreakdown = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
    });

    // Get revenue by kitchen
    const kitchenRevenue = await prisma.kitchen.findMany({
      select: {
        id: true,
        name: true,
        totalRevenue: true,
        totalOrders: true,
        rating: true,
      },
      orderBy: { totalRevenue: "desc" },
      take: 10,
    });

    // Get top menu items
    const topMenuItems = await prisma.menu_items.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        rating: true,
        reviewCount: true,
      },
      orderBy: { reviewCount: "desc" },
      take: 10,
    });

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        kitchen: { select: { name: true } },
      },
    });

    return NextResponse.json({
      totalUsers,
      totalSellers,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOnboarding,
      orderStatusBreakdown,
      kitchenRevenue,
      topMenuItems,
      recentOrders,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
