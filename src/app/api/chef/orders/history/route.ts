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
        { error: "Only sellers can access orders" },
        { status: 403 },
      ),
    };
  }

  return { userId };
}

/**
 * GET /api/chef/orders/history
 * Fetch all orders (including completed and cancelled) for order history
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;

    const { userId } = auth;

    // Get kitchen
    const kitchen = await prisma.kitchen.findFirst({
      where: { sellerId: userId },
      select: { id: true },
    });

    if (!kitchen) {
      return NextResponse.json(
        { error: "Kitchen not found" },
        { status: 404 }
      );
    }

    // Get query params for filtering
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status"); // "ALL", "COMPLETED", "CANCELLED", etc.
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where: any = {
      kitchenId: kitchen.id,
    };

    // Filter by status if provided
    if (statusFilter && statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    // Fetch all orders for this kitchen
    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        userId: true,
        total: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        delivery_date: true,
        delivery_time_slot: true,
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                menu_item_images: {
                  take: 1,
                  orderBy: { order: "asc" },
                  select: {
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Transform orders to match frontend format
    const transformedOrders = orders.map((order) => {
      // Format delivery time
      let deliveryTimeDisplay = "Not set";
      if (order.delivery_date && order.delivery_time_slot) {
        const deliveryDate = new Date(order.delivery_date);
        const dateStr = deliveryDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        const timeSlotNames: Record<string, string> = {
          BREAKFAST: "Breakfast",
          LUNCH: "Lunch",
          SNACKS: "Snacks",
          DINNER: "Dinner",
        };
        const slotName = timeSlotNames[order.delivery_time_slot] || order.delivery_time_slot;
        deliveryTimeDisplay = `${dateStr}, ${slotName}`;
      }

      // Get order images from menu items
      const images = order.items
        .map((item) => item.menuItem.menu_item_images[0]?.imageUrl)
        .filter(Boolean) as string[];

      // Create items summary
      const itemsSummary = order.items
        .map((item) => `${item.menuItem.name} (${item.quantity}x)`)
        .join(", ");

      return {
        id: order.id,
        orderNumber: `#${order.id.slice(-6).toUpperCase()}`,
        status: order.status,
        customerName: order.user.name || "Unknown",
        customerPhone: order.user.phone || "N/A",
        items: order.items.map((item) => ({
          name: item.menuItem.name,
          quantity: item.quantity,
          price: item.price,
        })),
        itemsSummary,
        totalPrice: order.total,
        specialNotes: order.notes || undefined,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        deliveryDate: order.delivery_date ? new Date(order.delivery_date).toISOString() : null,
        deliveryTimeSlot: order.delivery_time_slot,
        deliveryTimeDisplay,
        images: images.length > 0 ? images : ["/placeholder-dish.jpg"],
        userId: order.userId,
      };
    });

    return NextResponse.json({ 
      success: true, 
      data: transformedOrders,
      total: transformedOrders.length,
    });
  } catch (error) {
    console.error("Error fetching order history:", error);
    return NextResponse.json(
      { error: "Failed to fetch order history" },
      { status: 500 }
    );
  }
}
