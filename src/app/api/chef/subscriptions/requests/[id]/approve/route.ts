/**
 * @swagger
 * /api/chef/subscriptions/requests/{id}/approve:
 *   patch:
 *     summary: Approve a subscription request
 *     tags: [Chef Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Subscription approved successfully
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

    // Update subscription status to ACTIVE
    const updated = await prisma.user_subscriptions.update({
      where: { id },
      data: {
        status: "ACTIVE",
        confirmedAt: new Date(),
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

    // Update plan subscriber count
    await prisma.subscription_plans.update({
      where: { id: subscription.planId },
      data: {
        subscriber_count: {
          increment: 1,
        },
        monthly_revenue: {
          increment: subscription.monthlyPrice,
        },
      },
    });

    // Create notification for the user
    try {
      await prisma.notification.create({
        data: {
          userId: subscription.userId,
          type: "SUCCESS",
          title: "Subscription Approved",
          message: `Your subscription to "${updated.plan.name}" has been approved and is now active!`,
          actionUrl: "/profile/my-subscription",
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
        confirmedAt: updated.confirmedAt,
      },
    });
  } catch (error) {
    console.error("PATCH /api/chef/subscriptions/requests/[id]/approve:", error);
    return NextResponse.json(
      { success: false, error: "Failed to approve subscription" },
      { status: 500 }
    );
  }
}
