import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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
        { error: "Only sellers can access menu reviews" },
        { status: 403 },
      ),
    };
  }

  return { userId };
}

/**
 * GET /api/chef/menu/[id]/reviews
 * Get reviews for a menu item (chef view)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;

    const { userId } = auth;
    const { id } = await params;

    // Verify menu item belongs to chef
    const menuItem = await prisma.menu_items.findUnique({
      where: { id },
      select: { chef_id: true },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    if (menuItem.chef_id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized - Menu item does not belong to you" },
        { status: 403 }
      );
    }

    // Fetch reviews for this menu item
    const reviews = await prisma.review.findMany({
      where: { menuItemId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform to match frontend format
    const transformedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment || "",
      customerName: review.user.name || "Anonymous",
      date: review.createdAt.toISOString(),
      isAppealedByChef: false, // TODO: Implement appeal system if needed
      appealReason: undefined,
    }));

    return NextResponse.json({ success: true, data: transformedReviews });
  } catch (error) {
    console.error("Error fetching menu item reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
