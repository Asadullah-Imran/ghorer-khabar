/**
 * Cron Job: Generate Orders from Active Subscriptions
 * 
 * This endpoint should be called daily (e.g., at midnight) to generate orders
 * for tomorrow's meals based on active subscription plans.
 * 
 * Setup:
 * - Vercel: Add to vercel.json crons
 * - Other: Use external cron service (cron-job.org, EasyCron, etc.)
 * 
 * Security: This endpoint should be protected with a secret token
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { MealType } from "@/../generated/prisma/client";
import { getDeliveryInfo } from "@/lib/services/deliveryCharge";

// Helper to get day name in uppercase (matching schema format)
function getDayName(date: Date): string {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[date.getDay()];
}

// Verify cron secret (optional but recommended)
function verifyCronSecret(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    // If no secret is set, allow access (for development)
    return true;
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret if set
    if (!verifyCronSecret(req)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Start of day
    
    const tomorrowDayName = getDayName(tomorrow);
    console.log(`[Subscription Orders] Generating orders for ${tomorrowDayName}, ${tomorrow.toLocaleDateString()}`);

    // Find all ACTIVE subscriptions
    const activeSubscriptions = await prisma.user_subscriptions.findMany({
      where: {
        status: "ACTIVE",
        // Only subscriptions that have started
        startDate: {
          lte: tomorrow,
        },
        // Only subscriptions that haven't ended (if endDate is set)
        OR: [
          { endDate: null },
          { endDate: { gte: tomorrow } },
        ],
      },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            weekly_schedule: true,
            kitchen_id: true,
            servings_per_meal: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`[Subscription Orders] Found ${activeSubscriptions.length} active subscriptions`);

    const results = {
      processed: 0,
      created: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Process each subscription
    for (const subscription of activeSubscriptions) {
      try {
        const weeklySchedule = subscription.plan.weekly_schedule as any;
        
        if (!weeklySchedule || typeof weeklySchedule !== 'object') {
          console.log(`[Subscription Orders] Skipping subscription ${subscription.id} - no schedule`);
          results.skipped++;
          continue;
        }

        const daySchedule = weeklySchedule[tomorrowDayName];
        
        if (!daySchedule || typeof daySchedule !== 'object') {
          console.log(`[Subscription Orders] Skipping subscription ${subscription.id} - no meals scheduled for ${tomorrowDayName}`);
          results.skipped++;
          continue;
        }

        // Get kitchen to find chef_id and capacity settings
        const kitchen = await prisma.kitchen.findUnique({
          where: { id: subscription.kitchenId },
          select: { sellerId: true, max_capacity: true },
        });

        if (!kitchen) {
          console.log(`[Subscription Orders] Kitchen not found for subscription ${subscription.id}`);
          results.errors.push(`Subscription ${subscription.id}: Kitchen not found`);
          continue;
        }

        // Process each meal type separately (create separate orders)
        const mealSlots: Array<{ type: MealType, schedule: any }> = [
          { type: MealType.BREAKFAST, schedule: daySchedule.breakfast },
          { type: MealType.LUNCH, schedule: daySchedule.lunch },
          { type: MealType.SNACKS, schedule: daySchedule.snacks },
          { type: MealType.DINNER, schedule: daySchedule.dinner },
        ];

        let ordersCreatedForSubscription = 0;

        for (const mealSlot of mealSlots) {
          if (!mealSlot.schedule?.dishIds?.length) {
            continue; // Skip if no dishes for this meal
          }

          const dishIds = mealSlot.schedule.dishIds;
          const timeSlot = mealSlot.type;

          // Check if order already exists for this subscription, date, and time slot
          const deliveryDateStart = new Date(tomorrow);
          deliveryDateStart.setHours(0, 0, 0, 0);
          const deliveryDateEnd = new Date(tomorrow);
          deliveryDateEnd.setHours(23, 59, 59, 999);

          const existingOrder = await prisma.order.findFirst({
            where: {
              subscription_id: subscription.id,
              delivery_date: {
                gte: deliveryDateStart,
                lte: deliveryDateEnd,
              },
              delivery_time_slot: timeSlot,
            },
          });

          if (existingOrder) {
            console.log(`[Subscription Orders] Order already exists for subscription ${subscription.id}, ${tomorrow.toLocaleDateString()}, ${timeSlot}`);
            continue;
          }

          // Check kitchen capacity for this time slot (reuse dates from above)

          const currentOrdersCount = await prisma.order.count({
            where: {
              kitchenId: subscription.kitchenId,
              delivery_date: {
                gte: deliveryDateStart,
                lte: deliveryDateEnd,
              },
              delivery_time_slot: timeSlot,
              status: {
                notIn: ["CANCELLED"],
              },
            },
          });

          if (currentOrdersCount >= kitchen.max_capacity) {
            console.log(`[Subscription Orders] Kitchen full for ${timeSlot} on ${tomorrow.toLocaleDateString()}. Skipping subscription ${subscription.id}`);
            results.errors.push(`Subscription ${subscription.id}: Kitchen full for ${timeSlot}`);
            continue;
          }

          // Fetch menu items to get prices
          const menuItems = await prisma.menu_items.findMany({
            where: {
              id: { in: dishIds },
              chef_id: kitchen.sellerId,
            },
          });

          if (menuItems.length === 0) {
            console.log(`[Subscription Orders] No menu items found for subscription ${subscription.id}, ${timeSlot}`);
            results.errors.push(`Subscription ${subscription.id}: No menu items found for ${timeSlot}`);
            continue;
          }

          // Calculate total
          let total = 0;
          const orderItemsData = [];

          for (const dishId of dishIds) {
            const menuItem = menuItems.find(item => item.id === dishId);
            if (!menuItem) {
              console.warn(`[Subscription Orders] Menu item ${dishId} not found`);
              continue;
            }

            // Quantity is based on servings_per_meal from the plan (default to 1)
            const plan = subscription.plan as { servings_per_meal?: number };
            const quantity = plan.servings_per_meal || 1;
            const itemTotal = menuItem.price * quantity;
            total += itemTotal;

            orderItemsData.push({
              menuItemId: menuItem.id,
              quantity: quantity,
              price: menuItem.price,
            });
          }

          if (orderItemsData.length === 0) {
            console.log(`[Subscription Orders] No valid order items for subscription ${subscription.id}, ${timeSlot}`);
            continue;
          }

          // Add delivery fee (from subscription) - calculated when subscription was created
          // The delivery fee is stored per subscription and represents the fee for each delivery
          // For subscriptions, we add the delivery fee to each meal order
          const deliveryFee = subscription.deliveryFee || 0;
          total += deliveryFee;

          // Create order with delivery date and time slot
          const order = await prisma.order.create({
            data: {
              userId: subscription.userId,
              kitchenId: subscription.kitchenId,
              subscription_id: subscription.id,
              total: total,
              status: "PENDING",
              delivery_date: tomorrow,
              delivery_time_slot: timeSlot,
              notes: `Subscription order for ${subscription.plan.name} - ${timeSlot} on ${tomorrow.toLocaleDateString()}`,
              items: {
                create: orderItemsData,
              },
            },
          });

          console.log(`[Subscription Orders] Created order ${order.id} for subscription ${subscription.id}, ${timeSlot}`);
          ordersCreatedForSubscription++;
          results.created++;
        }

        if (ordersCreatedForSubscription === 0) {
          console.log(`[Subscription Orders] No orders created for subscription ${subscription.id} - all meals skipped or already exist`);
          results.skipped++;
        } else {
          results.processed++;
        }

        // Create notification for user (only if orders were created)
        if (ordersCreatedForSubscription > 0) {
          try {
            await prisma.notification.create({
              data: {
                userId: subscription.userId,
                type: "INFO",
                title: "Order Created from Subscription",
                message: `${ordersCreatedForSubscription} order(s) from your subscription "${subscription.plan.name}" have been created for ${tomorrow.toLocaleDateString()}.`,
                actionUrl: "/orders",
              },
            });
          } catch (notifError) {
            console.error(`[Subscription Orders] Failed to create notification (non-critical):`, notifError);
          }

          // Create notification for chef
          try {
            await prisma.notification.create({
              data: {
                kitchenId: subscription.kitchenId,
                type: "INFO",
                title: "New Subscription Orders",
                message: `${ordersCreatedForSubscription} new order(s) from subscription "${subscription.plan.name}" for ${subscription.user.name || 'customer'}.`,
              },
            });
          } catch (notifError) {
            console.error(`[Subscription Orders] Failed to create chef notification (non-critical):`, notifError);
          }
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[Subscription Orders] Error processing subscription ${subscription.id}:`, errorMessage);
        results.errors.push(`Subscription ${subscription.id}: ${errorMessage}`);
        results.processed++;
      }
    }

    console.log(`[Subscription Orders] Completed: ${results.created} created, ${results.skipped} skipped, ${results.errors.length} errors`);

    return NextResponse.json({
      success: true,
      date: tomorrow.toLocaleDateString(),
      day: tomorrowDayName,
      results,
    });
  } catch (error) {
    console.error("[Subscription Orders] Fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate orders",
      },
      { status: 500 }
    );
  }
}

// Also support POST for external cron services
export async function POST(req: NextRequest) {
  return GET(req);
}
