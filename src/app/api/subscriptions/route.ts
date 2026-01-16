/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get all active subscription plans (public)
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of plans to return
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, rating, newest, popular]
 *         description: Sorting option
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by plan or kitchen name
 *     responses:
 *       200:
 *         description: List of active subscription plans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */

import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Get query parameters
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "popular";
    const search = searchParams.get("search") || "";

    // Build where clause
    const where: any = {
      is_active: true,
    };

    // Add search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { kitchen: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Build order by clause
    let orderBy: any = { subscriber_count: "desc" }; // Default: popular

    if (sort === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sort === "rating") {
      orderBy = { rating: "desc" };
    } else if (sort === "newest") {
      orderBy = { created_at: "desc" };
    }

    // Fetch subscription plans
    const plans = await prisma.subscription_plans.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        kitchen: {
          select: {
            id: true,
            name: true,
            rating: true,
            location: true,
            area: true,
            reviewCount: true,
          },
        },
      },
    });

    // Transform data to match frontend expectations
    const transformedPlans = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      mealsPerDay: plan.meals_per_day,
      servingsPerMeal: plan.servings_per_meal,
      mealsPerMonth: plan.meals_per_day * 30,
      coverImage: plan.cover_image,
      rating: Number(plan.rating) || 0,
      calories: plan.calories,
      protein: plan.protein,
      carbs: plan.carbs,
      fats: plan.fats,
      chefQuote: plan.chef_quote,
      subscriberCount: plan.subscriber_count,
      monthlyRevenue: plan.monthly_revenue,
      isActive: plan.is_active,
      createdAt: plan.created_at,
      kitchen: plan.kitchen
        ? {
            id: plan.kitchen.id,
            name: plan.kitchen.name,
            rating: Number(plan.kitchen.rating) || 0,
            location: plan.kitchen.location,
            area: plan.kitchen.area,
            reviewCount: plan.kitchen.reviewCount,
          }
        : null,
      // For compatibility with PlanCard component
      image: plan.cover_image || "/placeholder-plan.jpg",
      type: plan.meals_per_day >= 3 ? "Full Day" : plan.meals_per_day >= 2 ? "Daily Plan" : "Single Meal",
    }));

    return NextResponse.json({
      success: true,
      data: transformedPlans,
      count: transformedPlans.length,
    });
  } catch (error) {
    console.error("GET /api/subscriptions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch subscription plans",
      },
      { status: 500 }
    );
  }
}
