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
        { error: "Only sellers can access notifications" },
        { status: 403 },
      ),
    };
  }

  return { userId };
}

/**
 * GET /api/chef/dashboard/notifications
 * Fetch notifications for a chef from the database
 * Query params:
 * - limit: number of notifications to fetch (default: 10)
 * - offset: pagination offset (default: 0)
 * - unreadOnly: boolean to fetch only unread notifications
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;

    const { userId } = auth;

    // Get kitchen
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

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Build where clause
    const where: any = { kitchenId: kitchen.id };
    if (unreadOnly) {
      where.read = false;
    }

    // Fetch notifications from database
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        read: true,
        actionUrl: true,
        createdAt: true,
      },
    });

    // Transform to match frontend expected format
    const transformedNotifications = notifications.map((notif) => ({
      id: notif.id,
      type: notif.type.toLowerCase() as "info" | "success" | "warning" | "error",
      title: notif.title,
      message: notif.message,
      timestamp: notif.createdAt,
      read: notif.read,
      actionUrl: notif.actionUrl,
    }));

    return NextResponse.json({ success: true, data: transformedNotifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chef/dashboard/notifications
 * Mark a notification as read
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;

    const { userId } = auth;
    const body = await req.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Get kitchen
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

    // Verify the notification belongs to this kitchen
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { kitchenId: true },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    if (notification.kitchenId !== kitchen.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this notification" },
        { status: 403 }
      );
    }

    // Update notification read status
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
      select: { id: true, read: true },
    });

    return NextResponse.json({
      success: true,
      data: { notificationId: updated.id, read: updated.read },
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chef/dashboard/notifications
 * Delete a notification
 */
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;

    const { userId } = auth;
    const searchParams = req.nextUrl.searchParams;
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Get kitchen
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

    // Verify the notification belongs to this kitchen
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { kitchenId: true },
    });

    if (!notification) {
      console.warn(`[Notifications DELETE] Notification ${notificationId} not found`);
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    if (notification.kitchenId !== kitchen.id) {
      console.warn(`[Notifications DELETE] Unauthorized: Notification ${notificationId} belongs to kitchen ${notification.kitchenId}, but user ${userId} owns kitchen ${kitchen.id}`);
      return NextResponse.json(
        { error: "Unauthorized to delete this notification" },
        { status: 403 }
      );
    }

    // Delete the notification
    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({
      success: true,
      data: { notificationId },
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
