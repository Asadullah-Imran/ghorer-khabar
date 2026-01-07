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
// import { getUserIdFromRequest, getChefKitchen, authErrors } from "@/lib/auth/chef-auth";
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

interface ScheduleRow {
  day_of_week: string;
  meal_type: string;
  time: string;
  dish_id: string | null;
}

function reconstructSchedule(rows: ScheduleRow[]): Record<string, DaySchedule> {
  const schedule: Record<string, DaySchedule> = {
    SATURDAY: {},
    SUNDAY: {},
    MONDAY: {},
    TUESDAY: {},
    WEDNESDAY: {},
    THURSDAY: {},
    FRIDAY: {},
  };

  for (const row of rows) {
    const slot = row.meal_type.toLowerCase() as keyof DaySchedule;
    if (!schedule[row.day_of_week][slot]) {
      schedule[row.day_of_week][slot] = {
        time: row.time,
        dishIds: [],
      };
    }
    if (row.dish_id) {
      schedule[row.day_of_week][slot]!.dishIds.push(row.dish_id);
    }
  }

  Object.keys(schedule).forEach((day) => {
    if (Object.keys(schedule[day]).length === 0) delete schedule[day];
  });

  return schedule;
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
    const TEMP_KITCHEN_ID = process.env.TEMP_KITCHEN_ID || "temp-kitchen-1";
    const { id } = await params;

    const plan = await prisma.subscription_plans.findUnique({
      where: { id },
    });

    if (!plan || plan.kitchen_id !== TEMP_KITCHEN_ID) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      );
    }

    const scheduleRows = await prisma.plan_schedules.findMany({
      where: { plan_id: id },
    });

    const schedule = reconstructSchedule(scheduleRows);

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
        schedule,
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
    const TEMP_KITCHEN_ID = process.env.TEMP_KITCHEN_ID || "temp-kitchen-1";
    const { id } = await params;
    const body = await req.json();
    const validated = updateSubscriptionSchema.parse(body);

    const existingPlan = await prisma.subscription_plans.findUnique({
      where: { id },
    });

    if (!existingPlan || existingPlan.kitchen_id !== TEMP_KITCHEN_ID) {
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
          ...(validated.schedule && { meals_per_day: mealsPerDay }),
        },
      });

      if (validated.schedule) {
        await tx.plan_schedules.deleteMany({ where: { plan_id: id } });

        // Get kitchen to validate chef_id for dishes
        const kitchen = await tx.kitchen.findUnique({
          where: { id: TEMP_KITCHEN_ID },
          select: { sellerId: true },
        });

        const scheduleEntries = Object.entries(validated.schedule) as [string, DaySchedule][];
        for (const [day, daySchedule] of scheduleEntries) {
          if (!daySchedule || typeof daySchedule !== "object") continue;

          for (const [slot, mealSlot] of Object.entries(daySchedule)) {
            if (!mealSlot?.dishIds?.length) continue;

            for (const dishId of mealSlot.dishIds) {
              const dish = await tx.menu_items.findUnique({
                where: { id: dishId },
              });
              if (!dish || !kitchen || dish.chef_id !== kitchen.sellerId) {
                throw new Error(
                  `Dish ${dishId} not found or doesn't belong to your kitchen`
                );
              }

              await tx.plan_schedules.create({
                data: {
                  plan_id: id,
                  day_of_week: day as "SATURDAY" | "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY",
                  meal_type: slot.toUpperCase() as "BREAKFAST" | "LUNCH" | "SNACKS" | "DINNER",
                  time: mealSlot.time,
                  dish_id: dishId,
                  dish_name: dish.name,
                  dish_desc: dish.description || null,
                  image_url: null,
                },
              });
            }
          }
        }
      }

      return updated;
    });

    const scheduleRows = await prisma.plan_schedules.findMany({
      where: { plan_id: id },
    });
    const schedule = reconstructSchedule(scheduleRows);

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        name: result.name,
        price: result.price,
        mealsPerDay: result.meals_per_day,
        schedule,
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
    const TEMP_KITCHEN_ID = process.env.TEMP_KITCHEN_ID || "temp-kitchen-1";
    const { id } = await params;

    const existingPlan = await prisma.subscription_plans.findUnique({
      where: { id },
    });

    if (!existingPlan || existingPlan.kitchen_id !== TEMP_KITCHEN_ID) {
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
