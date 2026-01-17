import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function getAuthenticatedUserId() {
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

  return { userId };
}

/**
 * POST /api/orders/[id]/cancel
 * Cancel an order
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedUserId();
    if (auth.error) return auth.error;

    const { userId } = auth;
    const { id } = await params;
    const body = await req.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: "Cancellation reason is required" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { id: { endsWith: id } }],
        userId,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order can be cancelled
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return NextResponse.json(
        { error: "This order cannot be cancelled at its current status" },
        { status: 400 }
      );
    }

    // Update order status to CANCELLED
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
        notes: `Cancelled by user. Reason: ${reason}`,
      },
    });

    // Create notification for the kitchen/chef
    await prisma.notification.create({
      data: {
        kitchenId: order.kitchenId,
        type: 'WARNING',
        title: 'Order Cancelled',
        message: `Order #${order.id.slice(-8).toUpperCase()} has been cancelled by the customer. Reason: ${reason}`,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      status: updatedOrder.status,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
