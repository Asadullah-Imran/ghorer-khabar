import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth/getAuthUser";

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user (optional - guests can submit tickets)
    const userId = await getAuthUserId();
    
    const body = await req.json();
    const { topic, orderNumber, message } = body;

    if (!topic || !message) {
      return NextResponse.json(
        { error: "Topic and message are required" },
        { status: 400 }
      );
    }

    // If topic is "Order Issue", validate order number
    if (topic === "Order Issue" && !orderNumber) {
      return NextResponse.json(
        { error: "Order number is required for order issues" },
        { status: 400 }
      );
    }

    // Create support ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: userId || undefined,
        topic,
        orderNumber: topic === "Order Issue" ? orderNumber : null,
        message,
        status: "OPEN",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notification for admins
    await prisma.notification.create({
      data: {
        type: "WARNING",
        title: `New Support Ticket: ${topic}`,
        message: `${ticket.user?.name || "Guest"} submitted a ${topic.toLowerCase()} ticket${
          orderNumber ? ` (Order: ${orderNumber})` : ""
        }`,
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      ticket,
      message: "Support ticket submitted successfully. Our team will respond soon.",
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return NextResponse.json(
      { error: "Failed to submit support ticket" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch support tickets" },
      { status: 500 }
    );
  }
}
