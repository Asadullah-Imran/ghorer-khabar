/**
 * @swagger
 * /api/chef/subscriptions/{id}:
 *   get:
 *     summary: Get subscription plan with schedule
 *     tags: [Chef Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Plan details
 *       404:
 *         description: Plan not found
 *
 *   put:
 *     summary: Update subscription plan
 *     tags: [Chef Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json: {}
 *     responses:
 *       200:
 *         description: Plan updated
 *       404:
 *         description: Plan not found
 *
 *   delete:
 *     summary: Delete subscription plan
 *     tags: [Chef Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Plan deleted
 *       404:
 *         description: Plan not found
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { getUserIdFromRequest, getChefKitchen, authErrors } from "@/lib/auth/chef-auth";
import { updateSubscriptionSchema } from "@/lib/validation";
import { ZodError } from "zod";

interface MealSlot {
  time: string;
  dishIds: string[];
}

interface DaySchedule {
  breakfast?: MealSlot;
  lunch?: MealSlot;
  snacks?: MealSlot;
  dinner?: MealSlot;
}

function calculateMealsPerDay(schedule: Record<string, unknown>): number {
  const mealCounts = Object.values(schedule)
    .filter((daySchedule) => daySchedule && typeof daySchedule === "object")
    .map((daySchedule) => {
      const typedDaySchedule = daySchedule as DaySchedule;
      return ["breakfast", "lunch", "snacks", "dinner"].filter(
        (slot) => {
          const key = slot as keyof DaySchedule;
          const mealSlot = typedDaySchedule[key];
          return mealSlot && mealSlot.dishIds && mealSlot.dishIds.length > 0;
        }
      ).length;
    });
  return Math.max(...mealCounts, 0);
}

export async function GET(
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

    const plan = await prisma.subscription_plans.findUnique({
      where: { id },
    });

    if (!plan || plan.kitchen_id !== kitchen.id) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        mealsPerDay: plan.meals_per_day,
        servingsPerMeal: plan.servings_per_meal,
        isActive: plan.is_active,
        subscriberCount: plan.subscriber_count,
        monthlyRevenue: plan.monthly_revenue,
        createdAt: plan.created_at,
        coverImage: plan.cover_image,
        schedule: plan.weekly_schedule as Record<string, DaySchedule>,
      },
    });
  } catch (error) {
    console.error("GET /api/chef/subscriptions/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const body = await req.json();
    const validated = updateSubscriptionSchema.parse(body);

    const existingPlan = await prisma.subscription_plans.findUnique({
      where: { id },
    });

    if (!existingPlan || existingPlan.kitchen_id !== kitchen.id) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      );
    }

    const mealsPerDay = validated.schedule
      ? calculateMealsPerDay(validated.schedule)
      : existingPlan.meals_per_day;

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.subscription_plans.update({
        where: { id },
        data: {
          ...(validated.name && { name: validated.name }),
          ...(validated.description !== undefined && {
            description: validated.description,
          }),
          ...(validated.price && { price: validated.price }),
          ...(validated.servingsPerMeal && {
            servings_per_meal: validated.servingsPerMeal,
          }),
          ...(validated.isActive !== undefined && {
            is_active: validated.isActive,
          }),
          ...(validated.coverImage && { cover_image: validated.coverImage }),
          ...(validated.schedule && { 
            meals_per_day: mealsPerDay,
            weekly_schedule: validated.schedule,
          }),
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        name: result.name,
        price: result.price,
        mealsPerDay: result.meals_per_day,
        schedule: result.weekly_schedule,
      },
    });
  } catch (error) {
    console.error("PUT /api/chef/subscriptions/[id]:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const existingPlan = await prisma.subscription_plans.findUnique({
      where: { id },
    });

    if (!existingPlan || existingPlan.kitchen_id !== kitchen.id) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      );
    }

    await prisma.subscription_plans.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Plan deleted",
    });
  } catch (error) {
    console.error("DELETE /api/chef/subscriptions/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete plan" },
      { status: 500 }
    );
  }
}
