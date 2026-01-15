import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Helper function to authenticate user
 */
async function authenticateUser(): Promise<string | null> {
  let userId: string | undefined;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (user && !authError) {
    userId = user.id;
  } else {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && typeof decoded === "object" && "userId" in decoded) {
        userId = decoded.userId as string;
      }
    }
  }

  return userId || null;
}

/**
 * DELETE /api/chef/delete-account
 * Permanently delete chef account and all related data:
 * 1. Delete kitchen profile
 * 2. Delete all menu items (and related ingredients, images)
 * 3. Delete all subscription plans
 * 4. Delete all inventory items
 * 5. Delete kitchen gallery
 * 6. Delete user account
 * 
 * This action is irreversible and will remove all data associated with the chef.
 */
export async function DELETE() {
  try {
    const userId = await authenticateUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a seller
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        email: true,
      },
    });

    if (!user || user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Only sellers can delete their chef account" },
        { status: 403 }
      );
    }

    // Get kitchen to verify it exists
    const kitchen = await prisma.kitchen.findFirst({
      where: { sellerId: userId },
      select: { id: true },
    });

    if (!kitchen) {
      return NextResponse.json(
        { error: "Kitchen not found" },
        { status: 404 }
      );
    }

    // Use a transaction to ensure all deletions happen atomically
    await prisma.$transaction(async (tx) => {
      // 1. Delete all ingredients for menu items belonging to this chef
      await tx.ingredients.deleteMany({
        where: {
          menu_items: {
            chef_id: userId,
          },
        },
      });

      // 2. Delete all menu item images for this chef's menu items
      await tx.menu_item_images.deleteMany({
        where: {
          menu_items: {
            chef_id: userId,
          },
        },
      });

      // 3. Delete all order items related to this chef's menu items
      await tx.order_items.deleteMany({
        where: {
          menu_items: {
            chef_id: userId,
          },
        },
      });

      // 4. Delete all menu items belonging to this chef
      await tx.menu_items.deleteMany({
        where: {
          chef_id: userId,
        },
      });

      // 5. Delete all subscription plans for this kitchen
      await tx.subscription_plans.deleteMany({
        where: {
          kitchen_id: kitchen.id,
        },
      });

      // 6. Delete all inventory items for this chef
      await tx.inventory_items.deleteMany({
        where: {
          chef_id: userId,
        },
      });

      // 7. Delete kitchen gallery
      await tx.kitchenGallery.deleteMany({
        where: {
          kitchenId: kitchen.id,
        },
      });

      // 8. Delete all orders related to this kitchen
      await tx.orders.deleteMany({
        where: {
          kitchen_id: kitchen.id,
        },
      });

      // 9. Delete the kitchen profile
      await tx.kitchen.delete({
        where: {
          id: kitchen.id,
        },
      });

      // 10. Delete any addresses associated with the user
      await tx.address.deleteMany({
        where: {
          userId: userId,
        },
      });

      // 11. Delete any email OTPs
      await tx.emailLogOTP.deleteMany({
        where: {
          userId: userId,
        },
      });

      // 12. Finally, delete the user account
      await tx.user.delete({
        where: {
          id: userId,
        },
      });
    });

    // Clear authentication cookies
    const cookieStore = await cookies();
    
    // Clear custom JWT cookie
    const cookieName = process.env.COOKIE_NAME || "auth_token";
    cookieStore.delete(cookieName);

    // Also sign out from Supabase if applicable
    const supabase = await createClient();
    await supabase.auth.signOut();

    // Return response with set-cookie headers to clear auth cookies on client
    const response = NextResponse.json({
      success: true,
      message: "Account and all related data have been permanently deleted",
    });

    // Clear custom JWT token cookie
    response.cookies.set(cookieName, "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Supabase will handle clearing its own cookies via signOut()
    // But we can also explicitly clear common Supabase cookie patterns
    // These are managed automatically by @supabase/ssr, but being explicit is safer
    response.cookies.set("sb-auth-token", "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error deleting chef account:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete account. Please try again or contact support.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
