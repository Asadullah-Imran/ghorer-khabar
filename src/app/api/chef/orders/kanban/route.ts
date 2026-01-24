import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
 * GET /api/chef/orders/kanban
 * Fetch orders grouped by status for kanban board
 * Returns orders in statuses: PENDING, CONFIRMED, PREPARING, DELIVERING, COMPLETED
 */
export async function GET() {
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

    // Fetch orders for this kitchen
    const orders = await prisma.order.findMany({
      where: {
        kitchenId: kitchen.id,
        status: {
          in: ["PENDING", "CONFIRMED", "PREPARING", "DELIVERING", "COMPLETED"],
        },
      },
      select: {
        id: true,
        userId: true,
        total: true,
        status: true,
        notes: true,
        createdAt: true,
        delivery_date: true,
        delivery_time_slot: true,
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                prepTime: true,
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
      orderBy: { createdAt: "asc" },
    });

    // Transform orders to match frontend format
    const transformedOrders = orders.map((order) => {
      // Calculate max prep time from order items
      const maxPrepTime = Math.max(
        ...order.items.map((item) => item.menuItem.prepTime || 0),
        0
      );

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
        const timeSlotTimes: Record<string, string> = {
          BREAKFAST: "08:00 AM",
          LUNCH: "01:00 PM",
          SNACKS: "04:00 PM",
          DINNER: "08:00 PM",
        };
        const slotName = timeSlotNames[order.delivery_time_slot] || order.delivery_time_slot;
        const slotTime = timeSlotTimes[order.delivery_time_slot] || "";
        deliveryTimeDisplay = `${dateStr}, ${slotTime}`;
      }

      return {
        id: order.id,
        orderNumber: `#${order.id.slice(-6).toUpperCase()}`,
        status: mapStatusToFrontend(order.status),
        customerName: order.user.name || "Unknown",
        customerPhone: order.user.phone || "N/A",
        items: order.items.map((item) => ({
          name: item.menuItem.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: order.total,
        specialNotes: order.notes || undefined,
        createdAt: order.createdAt,
        prepTime: maxPrepTime, // in minutes
        deliveryDate: order.delivery_date ? new Date(order.delivery_date).toISOString() : null,
        deliveryTimeSlot: order.delivery_time_slot,
        deliveryTimeDisplay,
        userId: order.userId,
      };
    });

    // Group by status
    const kanban = {
      new: transformedOrders.filter((o) => o.status === "new"),
      cooking: transformedOrders.filter((o) => o.status === "cooking"),
      ready: transformedOrders.filter((o) => o.status === "ready"),
      handover: transformedOrders.filter((o) => o.status === "handover"),
    };

    return NextResponse.json({ success: true, data: kanban });
  } catch (error) {
    console.error("Error fetching kanban orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

/**
 * Map database OrderStatus to frontend status
 */
function mapStatusToFrontend(status: string): "new" | "cooking" | "ready" | "handover" {
  switch (status) {
    case "PENDING":
      return "new";
    case "CONFIRMED":
    case "PREPARING":
      return "cooking";
    case "DELIVERING":
      return "ready";
    case "COMPLETED":
      return "handover";
    default:
      return "new";
  }
}
