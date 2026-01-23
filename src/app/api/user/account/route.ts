import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/user/account:
 *   delete:
 *     summary: Delete user account
 *     description: Permanently deletes the authenticated user's account and all associated data
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function DELETE(req: NextRequest) {
  try {
    // Get authenticated user ID
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user details before deletion
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        authProvider: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has any pending/accepted orders (not completed or cancelled)
    // Orders that are CONFIRMED, PREPARING, or DELIVERING cannot be deleted
    const activeOrders = await prisma.order.findMany({
      where: {
        userId: userId,
        status: {
          in: ["CONFIRMED", "PREPARING", "DELIVERING"],
        },
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (activeOrders.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete account",
          message: `You have ${activeOrders.length} active order(s) that are being prepared or delivered. Please wait until all orders are completed before deleting your account.`,
          hasActiveOrders: true,
        },
        { status: 400 }
      );
    }

    // Delete user from database (cascades to related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Delete from Supabase Auth (for all users)
    try {
      const supabase = createAdminClient();
      await supabase.auth.admin.deleteUser(userId);
    } catch (supabaseError) {
      console.warn("Could not delete Supabase user:", supabaseError);
      // Continue anyway as database record is deleted
    }

    // Clear authentication cookies
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    
    // Clear all Supabase cookies
    const allCookies = cookieStore.getAll();
    allCookies.forEach(cookie => {
      if (cookie.name.includes('supabase') || 
          cookie.name.includes('sb-') || 
          cookie.name.includes('auth')) {
        cookieStore.delete(cookie.name);
      }
    });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please try again." },
      { status: 500 }
    );
  }
}
