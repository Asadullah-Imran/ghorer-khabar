import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/favorites - Get user's favorites
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'dish', 'kitchen', 'plan', or null for all

    // Build where clause based on type
    const where: any = { userId };
    if (type === "dish") where.dishId = { not: null };
    else if (type === "kitchen") where.kitchenId = { not: null };
    else if (type === "plan") where.planId = { not: null };

    const favorites = await prisma.favorite.findMany({
      where,
      include: {
        dish: {
          include: {
            menu_item_images: true,
            users: {
              include: {
                kitchens: true,
              },
            },
          },
        },
        kitchen: true,
        plan: {
          include: {
            kitchen: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform the data to match the expected format
    const transformedFavorites = favorites.map((fav) => {
      if (fav.dish) {
        return {
          type: "dish",
          id: fav.dish.id,
          name: fav.dish.name,
          price: fav.dish.price,
          rating: fav.dish.rating || 0,
          image: fav.dish.menu_item_images[0]?.imageUrl || "/placeholder-dish.jpg",
          kitchen: fav.dish.users.kitchens[0]?.name || "Unknown Kitchen",
          kitchenId: fav.dish.users.kitchens[0]?.id || "unknown",
          kitchenName: fav.dish.users.kitchens[0]?.name || "Unknown Kitchen",
          kitchenLocation: fav.dish.users.kitchens[0]?.location || undefined,
          kitchenRating: Number(fav.dish.users.kitchens[0]?.rating) || 0,
          kitchenReviewCount: fav.dish.users.kitchens[0]?.reviewCount || 0,
          deliveryTime: "30-45 min",
        };
      } else if (fav.kitchen) {
        return {
          type: "kitchen",
          id: fav.kitchen.id,
          name: fav.kitchen.name,
          rating: Number(fav.kitchen.rating) || 0,
          reviews: fav.kitchen.reviewCount,
          image: fav.kitchen.coverImage || "/placeholder-kitchen.jpg",
          specialty: fav.kitchen.type || "Home Kitchen",
        };
      } else if (fav.plan) {
        return {
          type: "plan",
          id: fav.plan.id,
          name: fav.plan.name,
          description: fav.plan.description,
          price: fav.plan.price,
          mealsPerDay: fav.plan.meals_per_day,
          servingsPerMeal: fav.plan.servings_per_meal,
          mealsPerMonth: fav.plan.meals_per_day * 30,
          rating: Number(fav.plan.rating) || 0,
          image: fav.plan.cover_image || "/placeholder-plan.jpg",
          kitchen: fav.plan.kitchen?.name || "Unknown Kitchen",
          planType: fav.plan.meals_per_day >= 3 ? "Full Day" : fav.plan.meals_per_day >= 2 ? "Daily Plan" : "Single Meal",
        };
      }
      return null;
    }).filter(Boolean);

    return NextResponse.json({ favorites: transformedFavorites });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add a favorite
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, itemId } = body;

    if (!type || !itemId) {
      return NextResponse.json(
        { error: "Type and itemId are required" },
        { status: 400 }
      );
    }

    // Build the data object based on type
    const data: any = { userId };
    if (type === "dish") data.dishId = itemId;
    else if (type === "kitchen") data.kitchenId = itemId;
    else if (type === "plan") data.planId = itemId;
    else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Create the favorite (upsert to avoid duplicates)
    const favorite = await prisma.favorite.upsert({
      where:
        type === "dish"
          ? { userId_dishId: { userId, dishId: itemId } }
          : type === "kitchen"
          ? { userId_kitchenId: { userId, kitchenId: itemId } }
          : { userId_planId: { userId, planId: itemId } },
      update: {},
      create: data,
    });

    return NextResponse.json({ favorite, message: "Added to favorites" });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Remove a favorite
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, itemId } = body;

    if (!type || !itemId) {
      return NextResponse.json(
        { error: "Type and itemId are required" },
        { status: 400 }
      );
    }

    // Build the where clause based on type
    const where: any = { userId };
    if (type === "dish") where.dishId = itemId;
    else if (type === "kitchen") where.kitchenId = itemId;
    else if (type === "plan") where.planId = itemId;
    else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Delete the favorite
    await prisma.favorite.deleteMany({ where });

    return NextResponse.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
