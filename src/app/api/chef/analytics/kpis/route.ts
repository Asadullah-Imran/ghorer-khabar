import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { calculateChefRevenue } from "@/lib/services/revenueCalculation";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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
        { error: "Only sellers can access analytics" },
        { status: 403 },
      ),
    };
  }

  return { userId };
}

/**
 * GET /api/chef/analytics/kpis
 * Fetch only KPI metrics for fast refresh
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;
    const userId = auth.userId!;

    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get("days") || "30";
    const days = parseInt(daysParam);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get kitchen ID
    const kitchen = await prisma.kitchen.findFirst({
      where: { sellerId: userId },
      select: { id: true },
    });

    if (!kitchen) {
      return NextResponse.json({ error: "Kitchen not found" }, { status: 404 });
    }

    // Fetch orders for current period
    const orders = await prisma.order.findMany({
      where: {
        kitchenId: kitchen.id,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        userId: true,
        total: true,
        status: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Fetch orders for previous period
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);
    
    const previousOrders = await prisma.order.findMany({
      where: {
        kitchenId: kitchen.id,
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
      select: {
        total: true,
        status: true,
      },
    });

    // Filter for completed orders only (for revenue and avg order value)
    const completedOrders = orders.filter((o: any) => o.status === 'COMPLETED');
    const previousCompletedOrders = previousOrders.filter((o: any) => o.status === 'COMPLETED');

    // Calculate chef revenue using proper revenue calculation service
    // Chef Revenue = Items Total - Platform Fee (NOT order.total which includes delivery fee)
    const totalRevenue = await calculateChefRevenue(kitchen.id, startDate);
    const previousRevenue = await calculateChefRevenue(kitchen.id, previousStartDate, startDate);
    
    const totalOrders = completedOrders.length;
    const previousOrderCount = previousCompletedOrders.length;

    const revenueGrowth = previousRevenue > 0 
      ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100) 
      : 0;
    const ordersGrowth = previousOrderCount > 0 
      ? Math.round(((totalOrders - previousOrderCount) / previousOrderCount) * 100) 
      : 0;

    // Calculate profit: Chef Revenue - Ingredient Costs
    // For now, we'll use a simplified calculation. 
    // TODO: Calculate actual ingredient costs from order items if chefs have set ingredient costs
    // For now, using estimated 35% profit margin as fallback
    const netProfit = Math.round(totalRevenue * 0.35);
    const previousProfit = Math.round(previousRevenue * 0.35);
    const profitGrowth = previousProfit > 0 
      ? Math.round(((netProfit - previousProfit) / previousProfit) * 100) 
      : 0;

    const allReviews = orders.flatMap((o: any) => o.reviews);
    const avgRating = allReviews.length > 0
      ? parseFloat((allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length).toFixed(1))
      : 0;

    // Calculate customer retention
    const previousPeriodOrders = await prisma.order.findMany({
      where: {
        kitchenId: kitchen.id,
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
      select: { userId: true },
    });

    const currentCustomers = new Set(orders.map((o: any) => o.userId));
    const previousCustomers = new Set(previousPeriodOrders.map((o: any) => o.userId));
    const returningCustomers = new Set([...currentCustomers].filter(id => previousCustomers.has(id)));
    
    const customerRetention = currentCustomers.size > 0 
      ? Math.round((returningCustomers.size / currentCustomers.size) * 100)
      : 0;

    // Calculate fulfillment rate (completed / total orders)
    const fulfillmentRate = orders.length > 0 
      ? Math.round((completedOrders.length / orders.length) * 100)
      : 0;

    return NextResponse.json({
      totalRevenue: Math.round(totalRevenue),
      revenueGrowth,
      netProfit,
      profitGrowth,
      totalOrders,
      ordersGrowth,
      avgRating,
      maxRating: 5.0,
      additionalStats: {
        customerRetention,
        avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        fulfillmentRate,
      },
    });
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    return NextResponse.json(
      { error: "Failed to fetch KPI data" },
      { status: 500 }
    );
  }
}
