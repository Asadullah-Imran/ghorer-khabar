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
 * GET /api/chef/analytics
 * Fetch comprehensive analytics data including KPIs, revenue charts, top dishes, and AI insights
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;
    const userId = auth.userId!;

    // Get date range from query params (default to last 30 days)
    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get("days") || "30";
    const days = parseInt(daysParam);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get kitchen ID for this chef
    const kitchen = await prisma.kitchen.findFirst({
      where: { sellerId: userId },
      select: { id: true },
    });

    if (!kitchen) {
      return NextResponse.json({
        error: "Kitchen not found for this chef",
        message: "Please complete your kitchen setup first",
      }, { status: 404 });
    }

    // Fetch all orders for the kitchen within date range
    const orders = await prisma.order.findMany({
      where: {
        kitchenId: kitchen.id,
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        reviews: true,
      },
    });

    // Completed orders for revenue and avg order value
    const completedOrders = orders.filter((o: any) => o.status === 'COMPLETED');

    // Calculate KPIs (using only completed orders for revenue)
    const totalRevenue = completedOrders.reduce((sum: number, order: any) => sum + order.total, 0);
    const totalOrders = completedOrders.length;

    // Calculate previous period for growth metrics
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

    const previousRevenue = previousOrders.reduce((sum: number, order: any) => sum + order.total, 0);
    const previousOrderCount = previousOrders.length;

    // Calculate customer retention
    const currentCustomers = new Set(orders.map((o: any) => o.userId));
    const previousCustomers = new Set(previousOrders.map((o: any) => o.userId));
    const returningCustomers = new Set([...currentCustomers].filter(id => previousCustomers.has(id)));
    
    const customerRetention = currentCustomers.size > 0 
      ? Math.round((returningCustomers.size / currentCustomers.size) * 100)
      : 0;

    const revenueGrowth = previousRevenue > 0 
      ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100) 
      : 0;
    const ordersGrowth = previousOrderCount > 0 
      ? Math.round(((totalOrders - previousOrderCount) / previousOrderCount) * 100) 
      : 0;

    // Estimate profit (assuming 35% profit margin)
    const netProfit = Math.round(totalRevenue * 0.35);
    const previousProfit = Math.round(previousRevenue * 0.35);
    const profitGrowth = previousProfit > 0 
      ? Math.round(((netProfit - previousProfit) / previousProfit) * 100) 
      : 0;

    // Calculate average rating
    const allReviews = orders.flatMap((o: any) => o.reviews);
    const avgRating = allReviews.length > 0
      ? parseFloat((allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length).toFixed(1))
      : 0;

    // Generate weekly revenue data for chart
    const weeksCount = Math.ceil(days / 7);
    const weeklyData = Array.from({ length: Math.min(weeksCount, 4) }, (_, i) => {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const weekOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.created_at);
        return orderDate >= weekStart && orderDate < weekEnd;
      });

      const weekRevenue = weekOrders.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount.toString()), 0);
      const weekProfit = Math.round(weekRevenue * 0.35);

      return {
        week: `Week ${i + 1}`,
        revenue: Math.round(weekRevenue),
        profit: weekProfit,
      };
    });

    // Calculate top selling dishes
    const dishSales: Record<string, { name: string; sales: number; revenue: number }> = {};
    
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        if (item.menuItem) {
          const dishId = item.menuItemId;
          if (!dishSales[dishId]) {
            dishSales[dishId] = {
              name: item.menuItem.name,
              sales: 0,
              revenue: 0,
            };
          }
          dishSales[dishId].sales += item.quantity;
          dishSales[dishId].revenue += item.price * item.quantity;
        }
      });
    });

    const topDishes = Object.values(dishSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 4)
      .map((dish, index, array) => ({
        name: dish.name,
        sales: dish.sales,
        percentage: array[0].sales > 0 ? Math.round((dish.sales / array[0].sales) * 100) : 0,
      }));

    // Sentiment analysis from reviews
    const sentiment = {
      positive: ["Great Quality", "Fresh", "Tasty", "Good Service", "Recommended"],
      negative: ["No major issues"],
    };

    // Count positive reviews (4-5 stars) vs negative (1-3 stars)
    const positiveReviews = allReviews.filter((r: any) => r.rating >= 4).length;
    const negativeReviews = allReviews.filter((r: any) => r.rating < 4).length;
    
    if (negativeReviews > positiveReviews) {
      sentiment.negative = ["Quality concerns", "Service issues"];
    }

    // Generate insights based on data patterns
    const aiInsights = [];

    // Insight 1: Top dish
    if (topDishes.length > 0) {
      const topDish = topDishes[0];
      aiInsights.push({
        id: 1,
        title: "Top Seller",
        description: `'${topDish.name}' is your best seller with ${topDish.sales} orders.`,
        impact: "high" as const,
      });
    }

    // Insight 2: Revenue trend
    if (revenueGrowth > 0) {
      aiInsights.push({
        id: 2,
        title: "Revenue Up",
        description: `Revenue increased by ${revenueGrowth}% compared to previous period.`,
        impact: "high" as const,
      });
    } else if (revenueGrowth < 0) {
      aiInsights.push({
        id: 2,
        title: "Revenue Down",
        description: `Revenue decreased by ${Math.abs(revenueGrowth)}% compared to previous period.`,
        impact: "high" as const,
      });
    }

    // Insight 3: Rating
    if (avgRating > 0) {
      aiInsights.push({
        id: 3,
        title: "Customer Rating",
        description: `Your average rating is ${avgRating}/5.0 from ${allReviews.length} reviews.`,
        impact: "medium" as const,
      });
    } else {
      aiInsights.push({
        id: 3,
        title: "Build Your Rating",
        description: `Get your first customer reviews to see your rating.`,
        impact: "medium" as const,
      });
    }

    // Response data
    const analyticsData = {
      kpis: {
        totalRevenue: Math.round(totalRevenue),
        revenueGrowth,
        netProfit,
        profitGrowth,
        totalOrders,
        ordersGrowth,
        avgRating,
        maxRating: 5.0,
      },
      revenueChart: {
        weeks: weeklyData.map(w => w.week),
        revenue: weeklyData.map(w => w.revenue),
        profit: weeklyData.map(w => w.profit),
      },
      topDishes,
      sentiment,
      aiInsights,
      additionalStats: {
        customerRetention,
        avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        fulfillmentRate: completedOrders.length > 0 ? Math.round((completedOrders.length / orders.length) * 100) : 0,
      },
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
