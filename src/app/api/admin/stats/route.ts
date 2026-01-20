import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Calculate date ranges for weekly data (last 4 weeks)
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    
    // Get overall statistics - revenue only from COMPLETED orders
    const [totalUsers, totalSellers, activeSellers, totalOrders, totalRevenue, pendingOnboarding] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "SELLER" } }),
        prisma.kitchen.count({ where: { isVerified: true, onboardingCompleted: true } }),
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { status: "COMPLETED" },
        }),
        prisma.kitchen.count({ where: { isVerified: false } }),
      ]);

    // Get weekly performance data (last 4 weeks)
    const weeklyData = [];
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(now.getTime() - (week + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const [weekUsers, weekOrders, weekRevenue, completedOrders] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: { gte: weekStart, lt: weekEnd },
            role: { not: "ADMIN" }
          }
        }),
        prisma.order.count({
          where: { createdAt: { gte: weekStart, lt: weekEnd } }
        }),
        prisma.order.aggregate({
          _sum: { total: true },
          where: {
            createdAt: { gte: weekStart, lt: weekEnd },
            status: "COMPLETED"
          }
        }),
        prisma.order.count({
          where: {
            createdAt: { gte: weekStart, lt: weekEnd },
            status: "COMPLETED"
          }
        })
      ]);

      const weekNumber = 4 - week;
      weeklyData.push({
        name: `Week ${weekNumber}`,
        users: weekUsers,
        orders: weekOrders,
        completedOrders,
        revenue: weekRevenue._sum.total || 0
      });
    }
    
    // Reverse to show chronologically (oldest first)
    weeklyData.reverse();

    // Get order status breakdown
    const orderStatusBreakdown = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
    });

    // Get revenue by kitchen (only from completed orders)
    const kitchenRevenue = await prisma.kitchen.findMany({
      select: {
        id: true,
        name: true,
        rating: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Calculate revenue per kitchen from completed orders
    const kitchenRevenueWithData = await Promise.all(
      kitchenRevenue.map(async (kitchen) => {
        const [revenue, totalOrders] = await Promise.all([
          prisma.order.aggregate({
            _sum: { total: true },
            where: {
              kitchenId: kitchen.id,
              status: "COMPLETED"
            }
          }),
          prisma.order.count({
            where: { kitchenId: kitchen.id }
          })
        ]);
        
        return {
          ...kitchen,
          totalRevenue: revenue._sum?.total || 0,
          totalOrders
        };
      })
    );

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
      activeSellers,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOnboarding,
      orderStatusBreakdown,
      kitchenRevenue: kitchenRevenueWithData.sort((a, b) => b.totalRevenue - a.totalRevenue),
      topMenuItems,
      recentOrders,
      weeklyData
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
