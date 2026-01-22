import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendSupportTicketResolutionEmail } from "@/lib/email/emailService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "50");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { topic: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return NextResponse.json({ tickets, total });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch support tickets" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketId, status, adminReply, resolvedBy } = body;

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    // Fetch ticket first to get user email
    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
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

    if (!existingTicket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (adminReply) updateData.adminReply = adminReply;
    if (resolvedBy) updateData.resolvedBy = resolvedBy;
    if (status === "RESOLVED" || status === "CLOSED") {
      updateData.resolvedAt = new Date();
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
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

    // Send email if resolved
    if (status === "RESOLVED" && adminReply && ticket.user?.email) {
      try {
        await sendSupportTicketResolutionEmail(
          ticket.user.email,
          ticket.user.name,
          ticket.topic,
          ticket.orderNumber,
          ticket.message,
          adminReply
        );
      } catch (emailError) {
        console.error("Failed to send resolution email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ 
      success: true,
      ticket,
      message: status === "RESOLVED" 
        ? "Ticket resolved and email sent to user" 
        : "Ticket updated successfully"
    });
  } catch (error) {
    console.error("Error updating support ticket:", error);
    return NextResponse.json(
      { error: "Failed to update support ticket" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("id");

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID required" },
        { status: 400 }
      );
    }

    await prisma.supportTicket.delete({
      where: { id: ticketId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting support ticket:", error);
    return NextResponse.json(
      { error: "Failed to delete support ticket" },
      { status: 500 }
    );
  }
}
