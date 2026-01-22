/**
 * API endpoint to calculate delivery charge based on distance
 * GET /api/orders/calculate-delivery?kitchenId=xxx&addressId=xxx
 * or
 * GET /api/orders/calculate-delivery?kitchenId=xxx&lat=xxx&lng=xxx
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { getDeliveryInfo } from "@/lib/services/deliveryCharge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kitchenId = searchParams.get("kitchenId");
    const addressId = searchParams.get("addressId");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!kitchenId) {
      return NextResponse.json(
        { error: "kitchenId is required" },
        { status: 400 }
      );
    }

    // Get kitchen coordinates
    const kitchen = await prisma.kitchen.findUnique({
      where: { id: kitchenId },
      select: {
        latitude: true,
        longitude: true,
        address: {
          select: {
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    if (!kitchen) {
      return NextResponse.json(
        { error: "Kitchen not found" },
        { status: 404 }
      );
    }

    // Get kitchen coordinates (prefer direct lat/lng, fallback to address)
    const kitchenLat = kitchen.latitude ?? kitchen.address?.latitude ?? null;
    const kitchenLng = kitchen.longitude ?? kitchen.address?.longitude ?? null;

    if (!kitchenLat || !kitchenLng) {
      return NextResponse.json(
        {
          error: "Kitchen location is not set. Please contact the kitchen owner.",
          available: false,
        },
        { status: 400 }
      );
    }

    // Get buyer coordinates
    let buyerLat: number | null = null;
    let buyerLng: number | null = null;

    if (addressId) {
      // Get from address ID
      const address = await prisma.address.findUnique({
        where: { id: addressId },
        select: {
          latitude: true,
          longitude: true,
        },
      });

      if (!address) {
        return NextResponse.json(
          { error: "Address not found" },
          { status: 404 }
        );
      }

      buyerLat = address.latitude ?? null;
      buyerLng = address.longitude ?? null;
    } else if (lat && lng) {
      // Get from query parameters
      buyerLat = parseFloat(lat);
      buyerLng = parseFloat(lng);

      if (isNaN(buyerLat) || isNaN(buyerLng)) {
        return NextResponse.json(
          { error: "Invalid coordinates" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Either addressId or lat/lng is required" },
        { status: 400 }
      );
    }

    // Calculate delivery info
    const deliveryInfo = getDeliveryInfo(
      buyerLat,
      buyerLng,
      kitchenLat,
      kitchenLng
    );

    return NextResponse.json({
      success: true,
      data: deliveryInfo,
    });
  } catch (error: any) {
    console.error("Error calculating delivery charge:", error);
    return NextResponse.json(
      { error: "Failed to calculate delivery charge" },
      { status: 500 }
    );
  }
}
