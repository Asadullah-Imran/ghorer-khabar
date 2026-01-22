/**
 * GET /api/orders/available-slots
 * Get available time slots for ordering based on kitchen capacity and prep time
 * 
 * Query params:
 * - kitchenId: string (required)
 * - menuItemIds: string[] (required, comma-separated or JSON array)
 * - deliveryDate: string (optional, ISO date string, defaults to tomorrow)
 */

import { NextRequest, NextResponse } from "next/server";
import { getAvailableTimeSlots } from "@/lib/services/orderValidation";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const kitchenId = searchParams.get("kitchenId");
    const menuItemIdsParam = searchParams.get("menuItemIds");
    const deliveryDateParam = searchParams.get("deliveryDate");

    // Validation
    if (!kitchenId) {
      return NextResponse.json(
        { error: "kitchenId is required" },
        { status: 400 }
      );
    }

    if (!menuItemIdsParam) {
      return NextResponse.json(
        { error: "menuItemIds is required" },
        { status: 400 }
      );
    }

    // Parse menu item IDs
    let menuItemIds: string[];
    try {
      // Try parsing as JSON array first
      menuItemIds = JSON.parse(menuItemIdsParam);
    } catch {
      // If not JSON, try comma-separated
      menuItemIds = menuItemIdsParam.split(",").map((id) => id.trim());
    }

    if (menuItemIds.length === 0) {
      return NextResponse.json(
        { error: "At least one menu item ID is required" },
        { status: 400 }
      );
    }

    // Parse delivery date (default to tomorrow)
    let deliveryDate: Date;
    if (deliveryDateParam) {
      deliveryDate = new Date(deliveryDateParam);
      if (isNaN(deliveryDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid deliveryDate format. Use ISO date string." },
          { status: 400 }
        );
      }
    } else {
      // Default to tomorrow
      deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      deliveryDate.setHours(0, 0, 0, 0);
    }

    // Get available slots
    const slots = await getAvailableTimeSlots(kitchenId, menuItemIds, deliveryDate);

    return NextResponse.json({
      success: true,
      data: {
        deliveryDate: deliveryDate.toISOString().split("T")[0],
        slots,
      },
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch available slots",
      },
      { status: 500 }
    );
  }
}

// Also support POST for easier JSON body
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kitchenId, menuItemIds, deliveryDate } = body;

    // Validation
    if (!kitchenId) {
      return NextResponse.json(
        { error: "kitchenId is required" },
        { status: 400 }
      );
    }

    if (!menuItemIds || !Array.isArray(menuItemIds) || menuItemIds.length === 0) {
      return NextResponse.json(
        { error: "menuItemIds must be a non-empty array" },
        { status: 400 }
      );
    }

    // Parse delivery date (default to tomorrow)
    let deliveryDateParsed: Date;
    if (deliveryDate) {
      deliveryDateParsed = new Date(deliveryDate);
      if (isNaN(deliveryDateParsed.getTime())) {
        return NextResponse.json(
          { error: "Invalid deliveryDate format. Use ISO date string." },
          { status: 400 }
        );
      }
    } else {
      // Default to tomorrow
      deliveryDateParsed = new Date();
      deliveryDateParsed.setDate(deliveryDateParsed.getDate() + 1);
      deliveryDateParsed.setHours(0, 0, 0, 0);
    }

    // Get available slots
    const slots = await getAvailableTimeSlots(
      kitchenId,
      menuItemIds,
      deliveryDateParsed
    );

    return NextResponse.json({
      success: true,
      data: {
        deliveryDate: deliveryDateParsed.toISOString().split("T")[0],
        slots,
      },
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch available slots",
      },
      { status: 500 }
    );
  }
}
