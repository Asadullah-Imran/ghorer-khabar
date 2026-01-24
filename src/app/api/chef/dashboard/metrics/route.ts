import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { calculateKRI } from "@/lib/services/kriCalculation";

async function getAuthenticatedChefId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  let userId = user?.id;

  if (!userId && error) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && typeof decoded === "object" && "userId" in decoded) {
        userId = (decoded as any).userId as string;
      }
    }
  }

  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser || dbUser.role !== "SELLER") {
    return {
      error: NextResponse.json(
        { error: "Only sellers can access dashboard" },
        { status: 403 },
      ),
    };
  }

  return { userId };
}

/**
 * GET /api/chef/dashboard/metrics
 * Fetch all dashboard metrics including:
 * - Today's revenue
 * - Active orders count
 * - Kitchen Reliability Index (KRI) score
 * - Monthly revenue data
 * - Kitchen open/closed status
 */
export async function GET() {
  try {
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;

    const { userId } = auth;

    // Get kitchen details
    const kitchen = await prisma.kitchen.findFirst({
      where: { sellerId: userId },
      select: {
        id: true,
        name: true,
        isOpen: true,
        totalRevenue: true,
        totalOrders: true,
        rating: true,
      },
    });

    if (!kitchen) {
      return NextResponse.json(
        { error: "Kitchen not found. Please complete onboarding first." },
        { status: 404 }
      );
    }

    // Get today's revenue from orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get yesterday's date range for trend calculation
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // Run all independent queries in parallel for better performance
    const [
      todayOrders,
      activeOrders,
      yesterdayOrders,
      monthlyRevenue,
      kriResult,
    ] = await Promise.all([
      // Today's revenue
      prisma.order.findMany({
        where: {
          kitchenId: kitchen.id,
          createdAt: { gte: today },
          status: { in: ["CONFIRMED", "PREPARING", "DELIVERING", "COMPLETED"] },
        },
        select: { total: true },
      }),
      // Active orders count
      prisma.order.findMany({
        where: {
          kitchenId: kitchen.id,
          status: { in: ["PENDING", "CONFIRMED", "PREPARING"] },
        },
        select: { id: true },
      }),
      // Yesterday's revenue
      prisma.order.findMany({
        where: {
          kitchenId: kitchen.id,
          createdAt: { gte: yesterday, lte: yesterdayEnd },
          status: { in: ["CONFIRMED", "PREPARING", "DELIVERING", "COMPLETED"] },
        },
        select: { total: true },
      }),
      // Monthly revenue (optimized)
      getMonthlyRevenue(kitchen.id),
      // KRI calculation (with error handling)
      calculateKRI(kitchen.id).catch((error) => {
        console.error("Error calculating KRI for dashboard metrics:", error);
        return { kriScore: 0 };
      }),
    ]);

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.total, 0);

    // Calculate trend percentage
    let revenueTrend = 0;
    if (yesterdayRevenue > 0) {
      revenueTrend = Math.round(
        ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      );
    } else if (todayRevenue > 0) {
      revenueTrend = 100;
    }

    const kriScore = kriResult.kriScore || 0;

    const dashboardData = {
      revenueToday: `৳ ${todayRevenue.toLocaleString()}`,
      revenueTodayAmount: todayRevenue,
      activeOrders: activeOrders.length,
      kriScore: `${kriScore}/100`,
      kriScoreAmount: kriScore,
      kitchenOpen: kitchen.isOpen,
      monthlyRevenue,
      revenueTrend,
    };

    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard metrics" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/chef/dashboard/metrics
 * Update kitchen open/closed status
 */
export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;

    const { userId } = auth;
    const body = await req.json();
    const { isOpen } = body;

    if (typeof isOpen !== "boolean") {
      return NextResponse.json(
        { error: "Invalid isOpen value" },
        { status: 400 }
      );
    }

    const kitchen = await prisma.kitchen.findFirst({
      where: { sellerId: userId },
    });

    if (!kitchen) {
      return NextResponse.json(
        { error: "Kitchen not found" },
        { status: 404 }
      );
    }

    const updatedKitchen = await prisma.kitchen.update({
      where: { id: kitchen.id },
      data: { isOpen },
      select: { isOpen: true },
    });

    return NextResponse.json({
      success: true,
      data: { isOpen: updatedKitchen.isOpen },
    });
  } catch (error) {
    console.error("Error updating kitchen status:", error);
    return NextResponse.json(
      { error: "Failed to update kitchen status" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to calculate monthly revenue for the last 24 months (2 years)
 * Includes year information for proper filtering
 */
async function getMonthlyRevenue(kitchenId: string) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Calculate date range for last 24 months (2 years)
  const twentyFourMonthsAgo = new Date();
  twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24);
  twentyFourMonthsAgo.setDate(1);
  twentyFourMonthsAgo.setHours(0, 0, 0, 0);

  // Single query to get all orders from last 24 months
  const orders = await prisma.order.findMany({
    where: {
      kitchenId,
      createdAt: { gte: twentyFourMonthsAgo },
      status: { in: ["CONFIRMED", "PREPARING", "DELIVERING", "COMPLETED"] },
    },
    select: {
      total: true,
      createdAt: true,
    },
  });

  // Group orders by month+year and calculate revenue
  const monthlyRevenueMap = new Map<string, number>();
  
  // Initialize all 24 months with 0 revenue
  for (let i = 23; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    monthlyRevenueMap.set(monthKey, 0);
  }

  // Sum revenue by month
  for (const order of orders) {
    const orderDate = new Date(order.createdAt);
    const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
    const currentRevenue = monthlyRevenueMap.get(monthKey) || 0;
    monthlyRevenueMap.set(monthKey, currentRevenue + order.total);
  }

  // Convert map to array format with year information
  const monthlyData = [];
  for (let i = 23; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const revenue = monthlyRevenueMap.get(monthKey) || 0;

    monthlyData.push({
      month: months[date.getMonth()],
      revenue: Math.round(revenue),
      year: date.getFullYear(),
    });
  }

  return monthlyData;
}
