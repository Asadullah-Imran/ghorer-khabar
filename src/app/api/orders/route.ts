import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";
import { validateOrder } from "@/lib/services/orderValidation";
import { MealTimeSlot } from "@/lib/constants/mealTimeSlots";
import { getDeliveryInfo } from "@/lib/services/deliveryCharge";

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      console.error("Auth Error in /api/orders: No user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, notes, deliveryDetails, deliveryDate, deliveryTimeSlot, addressId, deliveryLat, deliveryLng } = body;

    // Basic validation
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // Validate delivery date and time slot
    if (!deliveryDate) {
      return NextResponse.json(
        { error: "deliveryDate is required" },
        { status: 400 }
      );
    }

    if (!deliveryTimeSlot) {
      return NextResponse.json(
        { error: "deliveryTimeSlot is required (BREAKFAST, LUNCH, SNACKS, or DINNER)" },
        { status: 400 }
      );
    }

    // Validate time slot enum
    const validTimeSlots: MealTimeSlot[] = ["BREAKFAST", "LUNCH", "SNACKS", "DINNER"];
    if (!validTimeSlots.includes(deliveryTimeSlot)) {
      return NextResponse.json(
        { error: "Invalid deliveryTimeSlot. Must be BREAKFAST, LUNCH, SNACKS, or DINNER" },
        { status: 400 }
      );
    }

    // Parse delivery date
    const deliveryDateParsed = new Date(deliveryDate);
    if (isNaN(deliveryDateParsed.getTime())) {
      return NextResponse.json(
        { error: "Invalid deliveryDate format. Use ISO date string." },
        { status: 400 }
      );
    }

    // 1. Fetch items from DB to get real prices and kitchenId
    const itemIds = items.map((i: any) => i.id);
    const dbItems = await prisma.menu_items.findMany({
      where: { id: { in: itemIds } },
      include: {
        users: {
          include: {
            kitchens: true,
          },
        },
      },
    });

    if (dbItems.length !== itemIds.length) {
      return NextResponse.json({ error: "Some items not found" }, { status: 400 });
    }

    // 2. Validate same kitchen
    // Note: Chef (User) -> Kitchens. We assume chef has 1 kitchen for now.
    const kitchenId = dbItems[0].users.kitchens[0]?.id;
    if (!kitchenId) {
       return NextResponse.json({ error: "Kitchen not found for these items" }, { status: 400 });
    }

    const isSameKitchen = dbItems.every(
      (item) => item.users.kitchens[0]?.id === kitchenId
    );

    if (!isSameKitchen) {
      return NextResponse.json(
        { error: "Items must be from the same kitchen" },
        { status: 400 }
      );
    }

    // 2.5. Check if user is trying to buy from their own kitchen
    const kitchen = await prisma.kitchen.findUnique({
      where: { id: kitchenId },
      select: { 
        sellerId: true,
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

    if (kitchen.sellerId === userId) {
      return NextResponse.json(
        { error: "You cannot purchase dishes from your own kitchen" },
        { status: 403 }
      );
    }

    // 2.6. Calculate delivery charge based on distance
    let deliveryFee = 60; // Default fallback
    let distanceKm: number | null = null;

    // Get buyer coordinates from addressId or lat/lng
    let buyerLat: number | null = null;
    let buyerLng: number | null = null;

    if (addressId) {
      // Get buyer address coordinates
      const buyerAddress = await prisma.address.findUnique({
        where: { id: addressId },
        select: {
          latitude: true,
          longitude: true,
        },
      });

      if (buyerAddress?.latitude && buyerAddress?.longitude) {
        buyerLat = buyerAddress.latitude;
        buyerLng = buyerAddress.longitude;
      }
    } else if (deliveryLat && deliveryLng) {
      // Use provided coordinates
      buyerLat = parseFloat(deliveryLat);
      buyerLng = parseFloat(deliveryLng);

      if (isNaN(buyerLat) || isNaN(buyerLng)) {
        return NextResponse.json(
          { error: "Invalid delivery coordinates" },
          { status: 400 }
        );
      }
    }

    // Calculate delivery if we have coordinates
    if (buyerLat !== null && buyerLng !== null) {
      const kitchenLat = kitchen.latitude ?? kitchen.address?.latitude ?? null;
      const kitchenLng = kitchen.longitude ?? kitchen.address?.longitude ?? null;

      if (kitchenLat && kitchenLng) {
        const deliveryInfo = getDeliveryInfo(
          buyerLat,
          buyerLng,
          kitchenLat,
          kitchenLng
        );

        distanceKm = deliveryInfo.distance;

        if (!deliveryInfo.available) {
          return NextResponse.json(
            { 
              error: deliveryInfo.error || "Delivery is not available for this distance",
              distance: distanceKm,
            },
            { status: 400 }
          );
        }

        if (deliveryInfo.charge !== null) {
          deliveryFee = deliveryInfo.charge;
        }
      }
    }

    // 3. Validate order (timing, capacity, prep time)
    const validation = await validateOrder(
      kitchenId,
      itemIds,
      deliveryDateParsed,
      deliveryTimeSlot
    );

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Order validation failed" },
        { status: 400 }
      );
    }

    // 4. Calculate Total
    let calculatedTotal = 0;
    const orderItemsData = dbItems.map((dbItem) => {
      const qty = items.find((i: any) => i.id === dbItem.id)?.quantity || 0;
      calculatedTotal += dbItem.price * qty;
      return {
        menuItemId: dbItem.id,
        quantity: qty,
        price: dbItem.price,
      };
    });

    // Add delivery fee (calculated above) and platform fee
    const PLATFORM_FEE = 10;
    const finalTotal = calculatedTotal + deliveryFee + PLATFORM_FEE;

    // 5. Create Order
    const order = await prisma.order.create({
      data: {
        userId: userId,
        kitchenId: kitchenId,
        total: finalTotal,
        status: "PENDING",
        notes: notes || "", // Handle null/undefined notes safely
        delivery_date: deliveryDateParsed,
        delivery_time_slot: deliveryTimeSlot,
        items: {
          create: orderItemsData,
        },
      },
    });

    // 6. Create notification for the chef/seller
    try {
      await prisma.notification.create({
        data: {
          kitchenId: kitchenId,
          type: "INFO",
          title: "New Order Received",
          message: `You have a new order #${order.id.slice(-6)} for ৳${finalTotal.toFixed(2)}`,
          read: false,
          actionUrl: "/chef/orders",
        },
      });
    } catch (notifError) {
      console.error("Failed to create chef notification (non-critical):", notifError);
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
