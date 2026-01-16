import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
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
      include: {
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
    });

    // Calculate metrics
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
    const previousRevenue = previousOrders.reduce((sum: number, order: any) => sum + order.total, 0);
    
    const totalOrders = orders.length;
    const previousOrderCount = previousOrders.length;

    const revenueGrowth = previousRevenue > 0 
      ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100) 
      : 0;
    const ordersGrowth = previousOrderCount > 0 
      ? Math.round(((totalOrders - previousOrderCount) / previousOrderCount) * 100) 
      : 0;

    const netProfit = Math.round(totalRevenue * 0.35);
    const previousProfit = Math.round(previousRevenue * 0.35);
    const profitGrowth = previousProfit > 0 
      ? Math.round(((netProfit - previousProfit) / previousProfit) * 100) 
      : 0;

    const allReviews = orders.flatMap((o: any) => o.reviews);
    const avgRating = allReviews.length > 0
      ? parseFloat((allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length).toFixed(1))
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
    });
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    return NextResponse.json(
      { error: "Failed to fetch KPI data" },
      { status: 500 }
    );
  }
}
