/**
 * @swagger
 * /api/chef/subscriptions:
 *   get:
 *     summary: List subscription plans
 *     tags: [Chef Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of plans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       name: { type: string }
 *                       price: { type: number }
 *                       mealsPerDay: { type: integer }
 *                       servingsPerMeal: { type: integer }
 *                       isActive: { type: boolean }
 *                       subscriberCount: { type: integer }
 *                       monthlyRevenue: { type: number }
 *                       createdAt: { type: string, format: date-time }
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create subscription plan
 *     tags: [Chef Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, servingsPerMeal, schedule]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Daily Deluxe Pack"
 *               description: { type: string }
 *               price:
 *                 type: number
 *                 example: 4500
 *               servingsPerMeal:
 *                 type: integer
 *                 example: 2
 *               isActive: { type: boolean, example: true }
 *               schedule:
 *                 type: object
 *                 example:
 *                   SATURDAY:
 *                     lunch:
 *                       time: "13:00"
 *                       dishIds: ["1", "5"]
 *     responses:
 *       201:
 *         description: Plan created
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
// import { getUserIdFromRequest, getChefKitchen, authErrors } from "@/lib/auth/chef-auth";
import { createSubscriptionSchema } from "@/lib/validation";
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

export async function GET(_req: NextRequest) {
  try {
    // TODO: Uncomment when auth ready
    // const userId = await getUserIdFromRequest(_req);
    // if (!userId) {
    //   return NextResponse.json(
    //     { success: false, error: authErrors.UNAUTHORIZED.message },
    //     { status: 401 }
    //   );
    // }
    // const kitchen = await getChefKitchen(userId);
    // if (!kitchen) {
    //   return NextResponse.json(
    //     { success: false, error: authErrors.KITCHEN_NOT_FOUND.message },
    //     { status: 404 }
    //   );
    // }

    const TEMP_KITCHEN_ID = process.env.TEMP_KITCHEN_ID || "temp-kitchen-1";

    const plans = await prisma.subscription_plans.findMany({
      where: { kitchen_id: TEMP_KITCHEN_ID },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        meals_per_day: true,
        servings_per_meal: true,
        is_active: true,
        subscriber_count: true,
        monthly_revenue: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    });

    const data = plans.map((plan) => ({
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
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/chef/subscriptions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // TODO: Uncomment when auth ready
    // const userId = await getUserIdFromRequest(req);
    // if (!userId) {
    //   return NextResponse.json(
    //     { success: false, error: authErrors.UNAUTHORIZED.message },
    //     { status: 401 }
    //   );
    // }
    // const kitchen = await getChefKitchen(userId);
    // if (!kitchen) {
    //   return NextResponse.json(
    //     { success: false, error: authErrors.KITCHEN_NOT_FOUND.message },
    //     { status: 404 }
    //   );
    // }

    const TEMP_KITCHEN_ID = process.env.TEMP_KITCHEN_ID || "temp-kitchen-1";
    const body = await req.json();
    const validated = createSubscriptionSchema.parse(body);

    const mealsPerDay = calculateMealsPerDay(validated.schedule);
      // Get kitchen to validate chef_id for dishes
      const kitchen = await prisma.kitchen.findUnique({
        where: { id: TEMP_KITCHEN_ID },
        select: { sellerId: true },
      });
      if (!kitchen) {
        return NextResponse.json(
          { success: false, error: "Kitchen not found" },
          { status: 404 }
        );
      }
    const result = await prisma.$transaction(async (tx) => {
      const plan = await tx.subscription_plans.create({
        data: {
          kitchen_id: TEMP_KITCHEN_ID,
          name: validated.name,
          description: validated.description || null,
          price: validated.price,
          meals_per_day: mealsPerDay,
          servings_per_meal: validated.servingsPerMeal,
          is_active: validated.isActive,
          cover_image: validated.coverImage || null,
          calories: validated.calories || null,
          protein: validated.protein || null,
          carbs: validated.carbs || null,
          fats: validated.fats || null,
          chef_quote: validated.chefQuote || null,
        },
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
            if (!dish || dish.chef_id !== kitchen.sellerId) {
              throw new Error(
                `Dish ${dishId} not found or doesn't belong to your kitchen`
              );
            }

            await tx.plan_schedules.create({
              data: {
                plan_id: plan.id,
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

      return plan;
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: result.id,
          name: result.name,
          price: result.price,
          mealsPerDay: result.meals_per_day,
          servingsPerMeal: result.servings_per_meal,
          isActive: result.is_active,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/chef/subscriptions:", error);

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
      { success: false, error: "Failed to create plan" },
      { status: 500 }
    );
  }
}
