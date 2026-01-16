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
 * GET /api/chef/analytics/dishes
 * Fetch top selling dishes data
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
        createdAt: {
          gte: startDate,
        },
      },
      include: {
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

    // Calculate dish sales
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

    return NextResponse.json(topDishes);
  } catch (error) {
    console.error("Error fetching top dishes:", error);
    return NextResponse.json(
      { error: "Failed to fetch top dishes data" },
      { status: 500 }
    );
  }
}
