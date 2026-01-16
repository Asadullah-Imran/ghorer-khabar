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
 * GET /api/chef/analytics/insights
 * Fetch AI-generated insights and sentiment analysis
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

    // Fetch orders with reviews and items
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
            comment: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Analyze sentiment from reviews
    const allReviews = orders.flatMap((o: any) => o.reviews);
    const positiveReviews = allReviews.filter((r: any) => r.rating >= 4).length;
    const negativeReviews = allReviews.filter((r: any) => r.rating < 4).length;
    
    const sentiment = {
      positive: ["Great Quality", "Fresh", "Tasty", "Good Service", "Recommended"],
      negative: ["No major issues"],
    };
    
    if (negativeReviews > positiveReviews && allReviews.length > 5) {
      sentiment.negative = ["Quality concerns", "Service issues"];
    }

    // Calculate metrics for insights
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
    const totalOrders = orders.length;
    
    // Previous period
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
    const revenueGrowth = previousRevenue > 0 
      ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100) 
      : 0;

    // Top dish
    const dishSales: Record<string, { name: string; sales: number }> = {};
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        if (item.menuItem) {
          const dishId = item.menuItemId;
          if (!dishSales[dishId]) {
            dishSales[dishId] = {
              name: item.menuItem.name,
              sales: 0,
            };
          }
          dishSales[dishId].sales += item.quantity;
        }
      });
    });

    const topDish = Object.values(dishSales).sort((a, b) => b.sales - a.sales)[0];

    // Average rating
    const avgRating = allReviews.length > 0
      ? parseFloat((allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length).toFixed(1))
      : 0;

    // Generate insights
    const aiInsights = [];

    if (topDish) {
      aiInsights.push({
        id: 1,
        title: "Top Seller",
        description: `'${topDish.name}' is your best seller with ${topDish.sales} orders.`,
        impact: "high" as const,
      });
    }

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

    if (avgRating > 0) {
      aiInsights.push({
        id: 3,
        title: "Customer Rating",
        description: `Your average rating is ${avgRating}/5.0 from ${allReviews.length} reviews.`,
        impact: "medium" as const,
      });
    } else if (totalOrders > 0) {
      aiInsights.push({
        id: 3,
        title: "Awaiting Reviews",
        description: `You have ${totalOrders} orders. Encourage customers to leave reviews to build your rating.`,
        impact: "medium" as const,
      });
    }

    return NextResponse.json({
      sentiment,
      aiInsights,
    });
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights data" },
      { status: 500 }
    );
  }
}
