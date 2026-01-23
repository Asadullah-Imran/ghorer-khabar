import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";

export async function GET() {
  try {
    // Fetch all admin notifications sorted by creation date (newest first)
    const notifications = await prisma.adminNotification.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Count unread notifications
    const unreadCount = await prisma.adminNotification.count({
      where: {
        read: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
