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
 * GET /api/chef/analytics/chart
 * Fetch revenue chart data for visualization
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

    const orders = await prisma.order.findMany({
      where: {
        kitchenId: kitchen.id,
        status: {
          not: 'CANCELLED',
        },
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                ingredients: {
                  select: {
                    cost: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Generate weekly data (4 weeks)
    const weeklyData: Array<{
      week: string;
      revenue: number;
      profit: number;
    }> = [];

    const weeksCount = 4;
    const intervalDays = Math.ceil(days / weeksCount);

    for (let i = 0; i < weeksCount; i++) {
      // Calculate week start and end
      // We want Week 1 (Oldest) to Week 4 (Newest)
      // We'll work backwards from today for cleaner ranges, but populate array such that index 0 is oldest.
      // Actually, easier to go forward from startDate.
      
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (i * intervalDays));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + intervalDays);
      
      // Adjust last week to end of today
      if (i === weeksCount - 1) {
        weekEnd.setHours(23, 59, 59, 999);
      }

      const weekLabel = `Week ${i + 1}`;
      
      // Filter completed orders for this week
      const weekOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= weekStart && orderDate < weekEnd && o.status === 'COMPLETED';
      });

      let weekRevenue = 0;
      let weekCost = 0;

      // Calculate revenue and cost
      weekOrders.forEach((order: any) => {
        // Calculate Revenue
        const itemsTotal = order.items.reduce(
          (sum: number, item: any) => sum + (item.price * item.quantity),
          0
        );
        // Using constants hardcoded to match service (or could import, but inline is safe here)
        const PLATFORM_FEE_PER_ORDER = 10;
        const PLATFORM_COMMISSION_PERCENT = 0.05;
        
        const commission = itemsTotal * PLATFORM_COMMISSION_PERCENT;
        const orderRevenue = Math.max(0, order.total - PLATFORM_FEE_PER_ORDER - commission);
        weekRevenue += orderRevenue;

        // Calculate Cost
        order.items.forEach((item: any) => {
          if (item.menuItem?.ingredients) {
            const ingredientCost = item.menuItem.ingredients.reduce(
              (sum: number, ing: any) => sum + (ing.cost || 0),
              0
            );
            weekCost += ingredientCost * item.quantity;
          }
        });
      });

      // Profit Calculation
      const weekProfit = weekCost > 0 
        ? Math.round(weekRevenue - weekCost) 
        : Math.round(weekRevenue * 0.35);

      weeklyData.push({
        week: weekLabel,
        revenue: Math.round(weekRevenue),
        profit: weekProfit
      });
    }

    return NextResponse.json({
      weeks: weeklyData.map(w => w.week),
      revenue: weeklyData.map(w => w.revenue),
      profit: weeklyData.map(w => w.profit),
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}
