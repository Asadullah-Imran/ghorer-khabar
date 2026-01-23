import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getDeliveryInfo } from "@/lib/services/deliveryCharge";

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
 * POST /api/subscriptions/create
 * Create a new subscription request
 */
export async function POST(req: NextRequest) {
  try {
    console.log("[Subscription API] Starting subscription creation");
    
    const auth = await getAuthenticatedUserId();
    if (auth.error) return auth.error;

    const { userId } = auth;
    console.log("[Subscription API] User authenticated:", userId);
    
    const body = await req.json();
    const { planId, startDate, deliveryInstructions, useChefContainers, addressId, deliveryLat, deliveryLng } = body;
    console.log("[Subscription API] Request body:", { planId, startDate, deliveryInstructions, useChefContainers });

    // Validation
    if (!planId || !startDate) {
      console.log("[Subscription API] Validation failed - missing planId or startDate");
      return NextResponse.json(
        { error: "Plan ID and start date are required" },
        { status: 400 }
      );
    }

    // Fetch the plan details
    console.log("[Subscription API] Fetching plan:", planId);
    const plan = await prisma.subscription_plans.findUnique({
      where: { id: planId },
      include: {
        kitchen: {
          select: {
            id: true,
            name: true,
            area: true,
            isActive: true,
            isOpen: true,
            isVerified: true,
            sellerId: true,
            latitude: true,
            longitude: true,
            address: {
              select: {
                latitude: true,
                longitude: true,
              },
            },
          },
        },
      },
    });

    if (!plan) {
      console.log("[Subscription API] Plan not found");
      return NextResponse.json(
        { error: "Subscription plan not found" },
        { status: 404 }
      );
    }

    if (!plan.is_active) {
      console.log("[Subscription API] Plan is not active");
      return NextResponse.json(
        { error: "This plan is no longer available" },
        { status: 400 }
      );
    }

    // Check if kitchen is active and open
    if (!plan.kitchen) {
      console.log("[Subscription API] Kitchen not found for plan");
      return NextResponse.json(
        { error: "Kitchen not found" },
        { status: 404 }
      );
    }

    if (!plan.kitchen.isActive) {
      console.log("[Subscription API] Kitchen is not active (admin suspended)");
      return NextResponse.json(
        { error: "This kitchen is currently not accepting orders" },
        { status: 400 }
      );
    }

    if (!plan.kitchen.isOpen) {
      console.log("[Subscription API] Kitchen is closed");
      return NextResponse.json(
        { error: "This kitchen is temporarily closed and not accepting new subscriptions" },
        { status: 400 }
      );
    }

    if (!plan.kitchen.isVerified) {
      console.log("[Subscription API] Kitchen is not verified");
      return NextResponse.json(
        { error: "This kitchen is not verified yet" },
        { status: 400 }
      );
    }

    // Check if user is trying to subscribe to their own kitchen's plan
    if (plan.kitchen.sellerId === userId) {
      console.log("[Subscription API] User trying to subscribe to their own kitchen's plan");
      return NextResponse.json(
        { error: "You cannot subscribe to your own kitchen's meal plans" },
        { status: 403 }
      );
    }

    console.log("[Subscription API] Plan found, active, and kitchen is open");

    // Calculate delivery charge based on distance
    let deliveryFee = 300; // Default fallback
    let distanceKm: number | null = null;

    // Get buyer coordinates from addressId or lat/lng
    let buyerLat: number | null = null;
    let buyerLng: number | null = null;

    if (addressId) {
      // Get buyer address coordinates
      const buyerAddress = await prisma.address.findUnique({
        where: { id: addressId },
        select: {
          latitude: true,
          longitude: true,
        },
      });

      if (buyerAddress?.latitude && buyerAddress?.longitude) {
        buyerLat = buyerAddress.latitude;
        buyerLng = buyerAddress.longitude;
      }
    } else if (deliveryLat && deliveryLng) {
      // Use provided coordinates
      buyerLat = parseFloat(deliveryLat);
      buyerLng = parseFloat(deliveryLng);

      if (isNaN(buyerLat) || isNaN(buyerLng)) {
        return NextResponse.json(
          { error: "Invalid delivery coordinates" },
          { status: 400 }
        );
      }
    }

    // Calculate delivery if we have coordinates
    if (buyerLat !== null && buyerLng !== null) {
      const kitchenLat = plan.kitchen.latitude ?? plan.kitchen.address?.latitude ?? null;
      const kitchenLng = plan.kitchen.longitude ?? plan.kitchen.address?.longitude ?? null;

      if (kitchenLat && kitchenLng) {
        const deliveryInfo = getDeliveryInfo(
          buyerLat,
          buyerLng,
          kitchenLat,
          kitchenLng
        );

        distanceKm = deliveryInfo.distance;

        if (!deliveryInfo.available) {
          return NextResponse.json(
            { 
              error: deliveryInfo.error || "Delivery is not available for this distance",
              distance: distanceKm,
            },
            { status: 400 }
          );
        }

        if (deliveryInfo.charge !== null) {
          deliveryFee = deliveryInfo.charge;
        }
      }
    }

    // Calculate deliveries per month from weekly schedule
    const calculateDeliveriesPerMonth = (schedule: any): number => {
      if (!schedule || typeof schedule !== 'object') return 0;
      
      // Count how many days per week have at least one meal
      const daysWithMeals = Object.values(schedule).filter((daySchedule: any) => {
        if (!daySchedule || typeof daySchedule !== 'object') return false;
        // Check if any meal type (breakfast, lunch, snacks, dinner) has dishes
        return ['breakfast', 'lunch', 'snacks', 'dinner'].some(mealType => {
          const meal = daySchedule[mealType];
          return meal && meal.dishIds && Array.isArray(meal.dishIds) && meal.dishIds.length > 0;
        });
      }).length;
      
      // Deliveries per month = days per week × 4 weeks
      return daysWithMeals * 4;
    };

    const weeklySchedule = typeof plan.weekly_schedule === 'string' 
      ? JSON.parse(plan.weekly_schedule) 
      : plan.weekly_schedule || {};
    
    const deliveriesPerMonth = calculateDeliveriesPerMonth(weeklySchedule);
    
    // Calculate pricing
    const monthlyPrice = plan.price;
    const singleDeliveryFee = deliveryFee; // This is the per-delivery charge
    const totalDeliveryFee = singleDeliveryFee * deliveriesPerMonth; // Total for all deliveries
    const subtotal = monthlyPrice + totalDeliveryFee;
    const discount = Math.round(subtotal * 0.1); // 10% discount on subtotal
    const totalAmount = subtotal - discount;
    
    console.log("[Subscription API] Pricing calculated:", { 
      monthlyPrice, 
      singleDeliveryFee, 
      deliveriesPerMonth,
      totalDeliveryFee,
      subtotal,
      discount, 
      totalAmount, 
      distanceKm 
    });

    // Create the subscription
    console.log("[Subscription API] Creating subscription record");
    const subscription = await prisma.user_subscriptions.create({
      data: {
        userId,
        planId,
        kitchenId: plan.kitchen_id,
        startDate: new Date(startDate),
        deliveryInstructions: deliveryInstructions || null,
        useChefContainers: useChefContainers ?? true,
        monthlyPrice,
        deliveryFee: totalDeliveryFee, // Store total delivery fee for all deliveries
        discount,
        totalAmount,
        status: "PENDING",
      },
    });
    console.log("[Subscription API] Subscription created:", subscription.id);

    // Create notification for the kitchen/chef
    console.log("[Subscription API] Creating notification for kitchen:", plan.kitchen_id);
    try {
      await prisma.notification.create({
        data: {
          kitchenId: plan.kitchen_id,
          type: "INFO",
          title: "New Subscription Request",
          message: `You have a new subscription request for ${plan.name}. Please review and confirm.`,
        },
      });
      console.log("[Subscription API] Notification created successfully");
    } catch (notifError) {
      console.error("[Subscription API] Failed to create notification (non-critical):", notifError);
      // Don't fail the whole request if notification fails
    }

    console.log("[Subscription API] Success! Returning subscription ID");
    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      redirectUrl: `/subscriptions/success/${subscription.id}`,
    });
  } catch (error) {
    console.error("[Subscription API] ERROR:", error);
    if (error instanceof Error) {
      console.error("[Subscription API] Error message:", error.message);
      console.error("[Subscription API] Error stack:", error.stack);
    }
    return NextResponse.json(
      { 
        error: "Failed to create subscription",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
