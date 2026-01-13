import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";

export async function POST() {
  try {
    const TEMP_KITCHEN_ID = process.env.TEMP_KITCHEN_ID || "temp-kitchen-1";

    // Get kitchen info
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

    // Get existing menu items
    const menuItems = await prisma.menu_items.findMany({
      where: { chef_id: kitchen.sellerId },
      take: 3,
      select: { id: true, name: true },
    });

    if (menuItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "No menu items found. Create some first." },
        { status: 404 }
      );
    }

    // Create multiple subscription plans
    const plans = [
      {
        name: "Weekend Special",
        description: "Perfect for weekend family meals",
        price: 3500,
        servingsPerMeal: 4,
        isActive: true,
        schedule: {
          SATURDAY: {
            lunch: { time: "12:30", dishIds: [menuItems[0].id] },
            dinner: { time: "19:00", dishIds: [menuItems[0].id] },
          },
          SUNDAY: {
            lunch: { time: "12:30", dishIds: [menuItems[0].id] },
            dinner: { time: "19:00", dishIds: [menuItems[0].id] },
          },
        },
      },
      {
        name: "Weekday Lunch Box",
        description: "Healthy lunch delivered daily",
        price: 2500,
        servingsPerMeal: 1,
        isActive: true,
        schedule: {
          SATURDAY: { lunch: { time: "13:00", dishIds: [menuItems[0].id] } },
          SUNDAY: { lunch: { time: "13:00", dishIds: [menuItems[0].id] } },
          MONDAY: { lunch: { time: "13:00", dishIds: [menuItems[0].id] } },
          TUESDAY: { lunch: { time: "13:00", dishIds: [menuItems[0].id] } },
          WEDNESDAY: { lunch: { time: "13:00", dishIds: [menuItems[0].id] } },
        },
      },
      {
        name: "Premium Full Week",
        description: "Complete meal solution for busy professionals",
        price: 8900,
        servingsPerMeal: 2,
        isActive: true,
        schedule: {
          SATURDAY: {
            breakfast: { time: "08:00", dishIds: [menuItems[0].id] },
            lunch: { time: "13:00", dishIds: [menuItems[0].id] },
            dinner: { time: "19:30", dishIds: [menuItems[0].id] },
          },
          SUNDAY: {
            breakfast: { time: "08:00", dishIds: [menuItems[0].id] },
            lunch: { time: "13:00", dishIds: [menuItems[0].id] },
            dinner: { time: "19:30", dishIds: [menuItems[0].id] },
          },
          MONDAY: {
            breakfast: { time: "08:00", dishIds: [menuItems[0].id] },
            lunch: { time: "13:00", dishIds: [menuItems[0].id] },
            dinner: { time: "19:30", dishIds: [menuItems[0].id] },
          },
          TUESDAY: {
            breakfast: { time: "08:00", dishIds: [menuItems[0].id] },
            lunch: { time: "13:00", dishIds: [menuItems[0].id] },
            dinner: { time: "19:30", dishIds: [menuItems[0].id] },
          },
          WEDNESDAY: {
            breakfast: { time: "08:00", dishIds: [menuItems[0].id] },
            lunch: { time: "13:00", dishIds: [menuItems[0].id] },
            dinner: { time: "19:30", dishIds: [menuItems[0].id] },
          },
          THURSDAY: {
            breakfast: { time: "08:00", dishIds: [menuItems[0].id] },
            lunch: { time: "13:00", dishIds: [menuItems[0].id] },
            dinner: { time: "19:30", dishIds: [menuItems[0].id] },
          },
          FRIDAY: {
            breakfast: { time: "08:00", dishIds: [menuItems[0].id] },
            lunch: { time: "13:00", dishIds: [menuItems[0].id] },
            dinner: { time: "19:30", dishIds: [menuItems[0].id] },
          },
        },
      },
      {
        name: "Budget Dinner Plan",
        description: "Affordable dinner option",
        price: 1800,
        servingsPerMeal: 2,
        isActive: false, // This one is inactive
        schedule: {
          MONDAY: { dinner: { time: "20:00", dishIds: [menuItems[0].id] } },
          WEDNESDAY: { dinner: { time: "20:00", dishIds: [menuItems[0].id] } },
          FRIDAY: { dinner: { time: "20:00", dishIds: [menuItems[0].id] } },
        },
      },
    ];

    const created = [];
    for (const planData of plans) {
      const mealsPerDay = Math.max(
        ...Object.values(planData.schedule).map((day: any) => 
          Object.keys(day).length
        )
      );

      const plan = await prisma.subscription_plans.create({
        data: {
          kitchen_id: TEMP_KITCHEN_ID,
          name: planData.name,
          description: planData.description,
          price: planData.price,
          servings_per_meal: planData.servingsPerMeal,
          is_active: planData.isActive,
          meals_per_day: mealsPerDay,
        },
      });

      // Create schedules
      for (const [day, daySchedule] of Object.entries(planData.schedule)) {
        for (const [mealType, mealSlot] of Object.entries(daySchedule as any)) {
          for (const dishId of mealSlot.dishIds) {
            const dish = await prisma.menu_items.findUnique({
              where: { id: dishId },
            });

            await prisma.plan_schedules.create({
              data: {
                plan_id: plan.id,
                day_of_week: day as any,
                meal_type: mealType.toUpperCase() as any,
                time: mealSlot.time,
                dish_id: dishId,
                dish_name: dish?.name || "Unknown",
                dish_desc: dish?.description || null,
                image_url: null,
              },
            });
          }
        }
      }

      created.push({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        isActive: plan.is_active,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Created ${created.length} subscription plans`,
      plans: created,
      testEndpoint: `GET http://localhost:3000/api/chef/subscriptions`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
