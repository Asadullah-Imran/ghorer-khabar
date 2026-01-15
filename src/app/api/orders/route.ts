import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      console.error("Auth Error in /api/orders: No user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, notes, deliveryDetails } = body;

    // Basic validation
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
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

    // 3. Calculate Total
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

    // Add delivery fee (placeholder or fixed for now)
    const DELIVERY_FEE = 60;
    const PLATFORM_FEE = 10;
    const finalTotal = calculatedTotal + DELIVERY_FEE + PLATFORM_FEE;

    // 4. Create Order
    const order = await prisma.order.create({
      data: {
        userId: userId,
        kitchenId: kitchenId,
        total: finalTotal,
        status: "PENDING",
        notes: notes || "", // Handle null/undefined notes safely
        items: {
          create: orderItemsData,
        },
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
