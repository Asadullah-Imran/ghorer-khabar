import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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
    const { planId, startDate, deliveryInstructions, useChefContainers } = body;
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

    console.log("[Subscription API] Plan found and active");

    // Calculate pricing
    const monthlyPrice = plan.price;
    const deliveryFee = 300;
    const discount = 0;
    const totalAmount = monthlyPrice + deliveryFee - discount;
    console.log("[Subscription API] Pricing calculated:", { monthlyPrice, deliveryFee, discount, totalAmount });

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
        deliveryFee,
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
