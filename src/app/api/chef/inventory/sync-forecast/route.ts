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
 * POST /api/chef/inventory/sync-forecast
 * Get forecast from ML service and update inventory_items.forecastDemand
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;

    const { userId } = auth;

    // Step 1: Get chef's kitchen ID
    const kitchen = await prisma.kitchen.findFirst({
      where: { sellerId: userId },
      select: { id: true },
    });

    if (!kitchen) {
      return NextResponse.json(
        { error: "Kitchen not found for this chef" },
        { status: 404 }
      );
    }

    // Step 2: Call forecast API (internal Next.js API route)
    // Construct absolute URL from request
    const baseUrl = req.nextUrl.origin;
    const forecastUrl = `${baseUrl}/api/chef/forecast?days=7&model=moving_average`;
    
    // Forward cookies for authentication
    const cookieHeader = req.headers.get("cookie") || "";
    
    const forecastResponse = await fetch(forecastUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!forecastResponse.ok) {
      // If forecast API fails, return error but don't fail the sync
      const errorData = await forecastResponse.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch forecast",
          details: errorData.error || "Forecast service unavailable",
        },
        { status: forecastResponse.status }
      );
    }

    const forecastData = await forecastResponse.json();

    // Step 3: Extract ingredient forecasts with units
    const ingredientForecast = new Map<string, { value: number; unit: string }>();

    if (forecastData?.forecast?.ingredients) {
      for (const ing of forecastData.forecast.ingredients) {
        if (ing.ingredient_name && ing.predicted_demand !== undefined) {
          ingredientForecast.set(ing.ingredient_name, {
            value: ing.predicted_demand,
            unit: ing.unit || "unknown",
          });
        }
      }
    }

    // Step 4: Get all inventory items for this chef
    const inventoryItems = await prisma.inventory_items.findMany({
      where: { chef_id: userId },
    });

    // Step 5: Update inventory items with forecast demand (with unit conversion)
    const updates = [];
    let updatedCount = 0;
    const conversionLog: string[] = [];

    for (const item of inventoryItems) {
      const forecastData = ingredientForecast.get(item.name);
      
      if (!forecastData) {
        // No forecast for this item, set to 0
        if (item.forecastDemand !== 0) {
          updates.push(
            prisma.inventory_items.update({
              where: { id: item.id },
              data: { forecastDemand: 0 },
            })
          );
          updatedCount++;
        }
        continue;
      }

      // Convert forecast value to match inventory unit
      const convertedValue = convertForecastToInventoryUnit(
        forecastData.value,
        forecastData.unit,
        item.unit
      );

      // Log conversion for debugging
      if (forecastData.unit !== item.unit) {
        conversionLog.push(
          `${item.name}: ${forecastData.value} ${forecastData.unit} → ${convertedValue.toFixed(2)} ${item.unit}`
        );
      }

      if (Math.abs(item.forecastDemand - convertedValue) > 0.01) {
        updates.push(
          prisma.inventory_items.update({
            where: { id: item.id },
            data: { forecastDemand: convertedValue },
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
      message: "Synced forecast demand from ML service",
      data: {
        ingredientsForecasted: ingredientForecast.size,
        itemsUpdated: updatedCount,
        conversions: conversionLog,
        forecastMap: Object.fromEntries(
          Array.from(ingredientForecast.entries()).map(([name, data]) => [
            name,
            `${data.value} ${data.unit}`,
          ])
        ),
      },
    });
  } catch (error) {
    console.error("Error syncing forecast:", error);
    return NextResponse.json(
      { error: "Failed to sync forecast demand" },
      { status: 500 }
    );
  }
}
