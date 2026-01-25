import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/prisma";
import { calculateChefRevenue } from "@/lib/services/revenueCalculation";
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

    // Generate monthly data
    const monthlyData: Array<{
      month: string;
      revenue: number;
      profit: number;
    }> = [];

    // Group orders by month
    const monthMap = new Map<string, any[]>();

    orders.forEach((order: any) => {
      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, []);
      }
      monthMap.get(monthKey)!.push(order);
    });

    // Process each month
    const sortedMonths = Array.from(monthMap.keys()).sort();
    
    for (const monthKey of sortedMonths) {
      const monthOrders = monthMap.get(monthKey)!;
      const [year, month] = monthKey.split('-');
      const monthDate = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      // Calculate month start and end dates
      const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthEnd = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

      // Calculate chef revenue for this month (using proper revenue calculation)
      const monthRevenue = await calculateChefRevenue(kitchen.id, monthStart, monthEnd);

      // Calculate cost from ingredients (only for completed orders)
      let monthCost = 0;
      const completedMonthOrders = monthOrders.filter((o: any) => o.status === 'COMPLETED');
      
      completedMonthOrders.forEach((order: any) => {
        order.items.forEach((item: any) => {
          if (item.menuItem?.ingredients) {
            const ingredientCost = item.menuItem.ingredients.reduce(
              (sum: number, ing: any) => sum + (ing.cost || 0),
              0
            );
            monthCost += ingredientCost * item.quantity;
          }
        });
      });

      // Profit = Chef Revenue - Ingredient Costs
      // If no ingredient costs are set, use estimated 35% profit margin
      const monthProfit = monthCost > 0 
        ? Math.round(monthRevenue - monthCost)
        : Math.round(monthRevenue * 0.35);

      monthlyData.push({
        month: monthName,
        revenue: Math.round(monthRevenue),
        profit: monthProfit,
      });
    }

    return NextResponse.json({
      weeks: monthlyData.map(m => m.month),
      revenue: monthlyData.map(m => m.revenue),
      profit: monthlyData.map(m => m.profit),
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}
