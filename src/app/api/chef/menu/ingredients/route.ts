import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

async function getAuthenticatedChefId() {
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

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser || dbUser.role !== "SELLER") {
    return {
      error: NextResponse.json(
        { error: "Only sellers can access menu ingredients" },
        { status: 403 },
      ),
    };
  }

  return { userId };
}

/**
 * GET /api/chef/menu/ingredients
 * Get all menu dishes with their ingredients for the authenticated chef
 * Used for inventory item selection dropdown
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;

    const { userId } = auth;

    // Fetch all menu items with their ingredients
    const menuItems = await prisma.menu_items.findMany({
      where: {
        chef_id: userId,
        isAvailable: true, // Only show available dishes
      },
      select: {
        id: true,
        name: true,
        category: true,
        ingredients: {
          select: {
            id: true,
            name: true,
            quantity: true,
            unit: true,
            cost: true,
          },
          orderBy: {
            name: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Transform data to include unique ingredients across all dishes
    const dishesWithIngredients = menuItems.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      ingredients: item.ingredients.map((ing) => ({
        id: ing.id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        cost: ing.cost,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: dishesWithIngredients,
    });
  } catch (error) {
    console.error("Error fetching menu ingredients:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu ingredients" },
      { status: 500 }
    );
  }
}
