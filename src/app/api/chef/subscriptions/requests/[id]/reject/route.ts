/**
 * @swagger
 * /api/chef/subscriptions/requests/{id}/reject:
 *   patch:
 *     summary: Reject a subscription request
 *     tags: [Chef Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Optional reason for rejection
 *     responses:
 *       200:
 *         description: Subscription rejected successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subscription request not found
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { getUserIdFromRequest, getChefKitchen, authErrors } from "@/lib/auth/chef-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: authErrors.UNAUTHORIZED.message },
        { status: 401 }
      );
    }

    const kitchen = await getChefKitchen(userId);
    if (!kitchen) {
      return NextResponse.json(
        { success: false, error: authErrors.KITCHEN_NOT_FOUND.message },
        { status: 404 }
      );
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { reason } = body;

    // Find the subscription request
    const subscription = await prisma.user_subscriptions.findUnique({
      where: { id },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Subscription request not found" },
        { status: 404 }
      );
    }

    // Verify it belongs to this chef's kitchen
    if (subscription.kitchenId !== kitchen.id) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    // Check if already processed
    if (subscription.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          error: `Subscription is already ${subscription.status.toLowerCase()}`,
        },
        { status: 400 }
      );
    }

    // Update subscription status to CANCELLED
    const updated = await prisma.user_subscriptions.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancellationReason: reason || "Rejected by chef",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create notification for the user
    try {
      await prisma.notification.create({
        data: {
          userId: subscription.userId,
          type: "WARNING",
          title: "Subscription Request Rejected",
          message: reason
            ? `Your subscription request for "${updated.plan.name}" has been rejected. Reason: ${reason}`
            : `Your subscription request for "${updated.plan.name}" has been rejected.`,
          actionUrl: "/explore/subscriptions",
        },
      });
    } catch (notifError) {
      console.error("Failed to create notification (non-critical):", notifError);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
        cancelledAt: updated.cancelledAt,
        cancellationReason: updated.cancellationReason,
      },
    });
  } catch (error) {
    console.error("PATCH /api/chef/subscriptions/requests/[id]/reject:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reject subscription" },
      { status: 500 }
    );
  }
}
