import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/reviews/check-eligibility?menuItemId=xxx
 * Check if user can review a menu item (has completed order with this item)
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const menuItemId = searchParams.get("menuItemId");

    if (!menuItemId) {
      return NextResponse.json(
        { error: "menuItemId is required" },
        { status: 400 }
      );
    }

    // Find completed orders that contain this menu item
    const orders = await prisma.order.findMany({
      where: {
        userId,
        status: "COMPLETED",
        items: {
          some: {
            menuItemId,
          },
        },
      },
      include: {
        items: {
          where: { menuItemId },
        },
        reviews: {
          where: {
            menuItemId,
            userId,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Check which orders have reviews already
    const eligibleOrders = orders.map((order) => ({
      orderId: order.id,
      orderDate: order.createdAt,
      hasReviewed: order.reviews.length > 0,
      canReview: order.reviews.length === 0,
    }));

    const canReview = eligibleOrders.some((o) => o.canReview);

    return NextResponse.json({
      success: true,
      data: {
        canReview,
        eligibleOrders,
      },
    });
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check eligibility" },
      { status: 500 }
    );
  }
}
