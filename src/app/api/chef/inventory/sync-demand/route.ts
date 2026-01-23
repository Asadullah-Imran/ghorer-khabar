import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { convertForecastToInventoryUnit } from "@/lib/utils/unitConverter";

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
        { error: "Only sellers can access inventory" },
        { status: 403 },
      ),
    };
  }

  return { userId };
}

/**
 * POST /api/chef/inventory/sync-demand
 * Calculate demand from pending orders and update inventory_items.demandFromOrders
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;

    const { userId } = auth;

    // Step 1: Get all pending orders for this chef
    const pendingOrders = await prisma.order.findMany({
      where: {
        kitchen: {
          sellerId: userId,
        },
        status: {
          in: ["PENDING", "CONFIRMED", "PREPARING"],
        },
      },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                ingredients: true,
              },
            },
          },
        },
      },
    });

    // Step 2: Calculate ingredient demand from orders (with units)
    const ingredientDemand = new Map<string, { value: number; unit: string }>();

    for (const order of pendingOrders) {
      for (const orderItem of order.items) {
        const menuItem = orderItem.menuItem;
        if (!menuItem) continue;

        for (const ingredient of menuItem.ingredients) {
          const current = ingredientDemand.get(ingredient.name) || { value: 0, unit: ingredient.unit };
          // Calculate: ingredient quantity * order item quantity
          const demand = ingredient.quantity * orderItem.quantity;
          ingredientDemand.set(ingredient.name, {
            value: current.value + demand,
            unit: ingredient.unit, // Use unit from ingredient
          });
        }
      }
    }

    // Step 3: Get all inventory items for this chef
    const inventoryItems = await prisma.inventory_items.findMany({
      where: { chef_id: userId },
    });

    // Step 4: Update inventory items with calculated demand (with unit conversion)
    const updates = [];
    let updatedCount = 0;
    const conversionLog: string[] = [];

    for (const item of inventoryItems) {
      const demandData = ingredientDemand.get(item.name);
      
      if (!demandData) {
        // No demand for this item, set to 0
        if (item.demandFromOrders !== 0) {
          updates.push(
            prisma.inventory_items.update({
              where: { id: item.id },
              data: { demandFromOrders: 0 },
            })
          );
          updatedCount++;
        }
        continue;
      }

      // Convert demand value to match inventory unit
      const convertedValue = convertForecastToInventoryUnit(
        demandData.value,
        demandData.unit,
        item.unit
      );

      // Log conversion for debugging
      if (demandData.unit !== item.unit) {
        conversionLog.push(
          `${item.name}: ${demandData.value} ${demandData.unit} → ${convertedValue.toFixed(2)} ${item.unit}`
        );
      }

      if (Math.abs(item.demandFromOrders - convertedValue) > 0.01) {
        updates.push(
          prisma.inventory_items.update({
            where: { id: item.id },
            data: { demandFromOrders: convertedValue },
          })
        );
        updatedCount++;
      }
    }

    // Execute all updates
    if (updates.length > 0) {
      await Promise.all(updates);
    }

    return NextResponse.json({
      success: true,
      message: `Synced demand from ${pendingOrders.length} pending orders`,
      data: {
        ordersProcessed: pendingOrders.length,
        ingredientsFound: ingredientDemand.size,
        itemsUpdated: updatedCount,
        conversions: conversionLog,
        demandMap: Object.fromEntries(
          Array.from(ingredientDemand.entries()).map(([name, data]) => [
            name,
            `${data.value} ${data.unit}`,
          ])
        ),
      },
    });
  } catch (error) {
    console.error("Error syncing demand:", error);
    return NextResponse.json(
      { error: "Failed to sync demand from orders" },
      { status: 500 }
    );
  }
}
