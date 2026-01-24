import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { createNotification, notifyUser } from "@/lib/notifications/notificationService";
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
        { error: "Only sellers can update orders" },
        { status: 403 },
      ),
    };
  }

  return { userId };
}

/**
 * PATCH /api/chef/orders/[id]/status
 * Update order status and handle notifications/revenue
 * Flow: PENDING -> CONFIRMED -> PREPARING -> DELIVERING -> COMPLETED
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;

    const { userId } = auth;
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    // Validate status
    const validStatuses = ["CONFIRMED", "PREPARING", "DELIVERING", "COMPLETED", "CANCELLED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

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

    // Get order with user info
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify order belongs to this kitchen
    if (order.kitchenId !== kitchen.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Validate status transition
    // Flow: PENDING -> CONFIRMED -> PREPARING -> DELIVERING -> COMPLETED
    const currentStatus = order.status;
    const validTransitions: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PREPARING", "DELIVERING", "CANCELLED"], // Allow skipping PREPARING
      PREPARING: ["DELIVERING", "CANCELLED"],
      DELIVERING: ["COMPLETED", "CANCELLED"],
      COMPLETED: [], // Final state
      CANCELLED: [], // Final state
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${currentStatus} to ${status}` },
        { status: 400 }
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const orderNumber = `#${id.slice(-6).toUpperCase()}`;
    const customerName = order.user.name || "Customer";

    // Create notifications
    // 1. Notify kitchen (chef)
    await createNotification({
      kitchenId: kitchen.id,
      type: getNotificationType(status),
      title: getNotificationTitle(status),
      message: getNotificationMessage(status, orderNumber, customerName),
    });

    // 2. Notify user (buyer)
    await notifyUser(
      order.userId,
      getNotificationType(status),
      getNotificationTitle(status),
      getNotificationMessage(status, orderNumber, customerName, true),
      `/orders/${id}/track` // Add tracking URL
    );

    // If status is COMPLETED, add revenue to kitchen
    if (status === "COMPLETED") {
      // Calculate chef revenue: items total - platform fee (৳10)
      // Import the calculation function
      const { calculateChefRevenueForOrder } = await import("@/lib/services/revenueCalculation");
      const chefRevenue = await calculateChefRevenueForOrder(order.id);

      await prisma.kitchen.update({
        where: { id: kitchen.id },
        data: {
          totalRevenue: {
            increment: chefRevenue, // Only chef revenue, not platform fee
          },
          totalOrders: {
            increment: 1,
          },
        },
      });

      // Notify kitchen about payment
      await createNotification({
        kitchenId: kitchen.id,
        type: "SUCCESS",
        title: "Payment Received",
        message: `৳${chefRevenue.toLocaleString()} credited from order ${orderNumber}`,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedOrder.id,
        status: updatedOrder.status,
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}

function getNotificationType(status: string): "INFO" | "SUCCESS" | "WARNING" | "ERROR" {
  switch (status) {
    case "CONFIRMED":
    case "COMPLETED":
      return "SUCCESS";
    case "CANCELLED":
      return "WARNING";
    default:
      return "INFO";
  }
}

function getNotificationTitle(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "Order Accepted";
    case "PREPARING":
      return "Order Cooking";
    case "DELIVERING":
      return "Order Ready";
    case "COMPLETED":
      return "Order Delivered";
    case "CANCELLED":
      return "Order Cancelled";
    default:
      return "Order Updated";
  }
}

function getNotificationMessage(
  status: string,
  orderNumber: string,
  customerName: string,
  isUser: boolean = false
): string {
  const prefix = isUser ? "Your" : `Order ${orderNumber} from ${customerName}`;
  
  switch (status) {
    case "CONFIRMED":
      return isUser
        ? `Your order ${orderNumber} has been accepted and will be prepared soon.`
        : `${prefix} has been accepted.`;
    case "PREPARING":
      return isUser
        ? `Your order ${orderNumber} is now being prepared.`
        : `${prefix} is now being prepared.`;
    case "DELIVERING":
      return isUser
        ? `Your order ${orderNumber} is ready for pickup/delivery.`
        : `${prefix} is ready for pickup/delivery.`;
    case "COMPLETED":
      return isUser
        ? `Your order ${orderNumber} has been successfully delivered. Thank you!`
        : `${prefix} has been successfully delivered.`;
    case "CANCELLED":
      return isUser
        ? `Your order ${orderNumber} has been cancelled.`
        : `${prefix} has been cancelled.`;
    default:
      return `${prefix} status updated.`;
  }
}
