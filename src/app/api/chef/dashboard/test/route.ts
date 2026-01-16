import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/chef/dashboard/test
 * Test authentication and debug dashboard issues
 */
export async function GET() {
  try {
    const debugInfo: any = { timestamp: new Date().toISOString() };

    // Test Supabase auth
    const supabase = await createClient();
    const {
      data: { user: supabaseUser },
      error: supabaseError,
    } = await supabase.auth.getUser();

    debugInfo.supabase = {
      user: supabaseUser?.id,
      error: supabaseError?.message,
    };

    // Test JWT cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    debugInfo.jwt = {
      tokenExists: !!token,
      decodedUserId: null as string | null,
    };

    if (token) {
      try {
        const decoded = verifyToken(token);
        if (decoded && typeof decoded === "object" && "userId" in decoded) {
          debugInfo.jwt.decodedUserId = (decoded as any).userId;
        }
      } catch (e: any) {
        debugInfo.jwt.error = e.message;
      }
    }

    // Determine authenticated user
    let userId = supabaseUser?.id;
    if (!userId && debugInfo.jwt.decodedUserId) {
      userId = debugInfo.jwt.decodedUserId;
    }

    debugInfo.authenticatedUserId = userId;

    if (userId) {
      // Test database user lookup
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
        },
      });

      debugInfo.dbUser = dbUser;

      if (dbUser?.role === "SELLER") {
        // Test kitchen lookup
        const kitchen = await prisma.kitchen.findFirst({
          where: { sellerId: userId },
          select: {
            id: true,
            name: true,
            isOpen: true,
            kriScore: true,
          },
        });

        debugInfo.kitchen = kitchen;

        if (kitchen) {
          // Test order count
          const orderCount = await prisma.order.count({
            where: { kitchenId: kitchen.id },
          });

          debugInfo.orderCount = orderCount;

          // Test today's orders
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const todayOrderCount = await prisma.order.count({
            where: {
              kitchenId: kitchen.id,
              createdAt: { gte: today },
            },
          });

          debugInfo.todayOrderCount = todayOrderCount;

          // Test notification count
          const notificationCount = await prisma.notification.count({
            where: { kitchenId: kitchen.id },
          });

          debugInfo.notificationCount = notificationCount;
        }
      }
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
