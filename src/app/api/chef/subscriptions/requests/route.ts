/**
 * @swagger
 * /api/chef/subscriptions/requests:
 *   get:
 *     summary: Get all subscription requests for chef's kitchen
 *     tags: [Chef Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of subscription requests
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Kitchen not found
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { getUserIdFromRequest, getChefKitchen, authErrors } from "@/lib/auth/chef-auth";

export async function GET(req: NextRequest) {
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

    // Fetch all subscription requests for this kitchen
    const requests = await prisma.user_subscriptions.findMany({
      where: {
        kitchenId: kitchen.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            meals_per_day: true,
            servings_per_meal: true,
            cover_image: true,
            weekly_schedule: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data for frontend
    const data = requests.map((request) => ({
      id: request.id,
      userId: request.userId,
      userName: request.user.name || "User",
      userEmail: request.user.email,
      userPhone: request.user.phone,
      userAvatar: request.user.avatar,
      planId: request.planId,
      planName: request.plan.name,
      planDescription: request.plan.description,
      planPrice: request.plan.price,
      planImage: request.plan.cover_image,
      mealsPerDay: request.plan.meals_per_day,
      servingsPerMeal: request.plan.servings_per_meal,
      status: request.status,
      startDate: request.startDate,
      endDate: request.endDate,
      deliveryInstructions: request.deliveryInstructions,
      useChefContainers: request.useChefContainers,
      monthlyPrice: request.monthlyPrice,
      deliveryFee: request.deliveryFee,
      discount: request.discount,
      totalAmount: request.totalAmount,
      createdAt: request.createdAt,
      confirmedAt: request.confirmedAt,
      cancelledAt: request.cancelledAt,
      cancellationReason: request.cancellationReason,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/chef/subscriptions/requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription requests" },
      { status: 500 }
    );
  }
}
