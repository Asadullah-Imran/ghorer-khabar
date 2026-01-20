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

    let tickets;
    const total = await prisma.supportTicket.count({ where });

    // If specific status is requested, use simple query
    if (status) {
      tickets = await prisma.supportTicket.findMany({
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
        orderBy: { created_at: "desc" },
      });
    } else {
      // If viewing all, prioritize Active (OPEN, IN_PROGRESS) over Resolved (RESOLVED, CLOSED)
      const activeStatuses = ["OPEN", "IN_PROGRESS"];
      const activeWhere = { ...where, status: { in: activeStatuses } };
      const resolvedWhere = { ...where, status: { notIn: activeStatuses } };

      const activeCount = await prisma.supportTicket.count({ where: activeWhere });

      const include = {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      };

      tickets = [];

      if (skip < activeCount) {
        // We are strictly inside the active range, or straddling the boundary
        const takeActive = Math.min(take, activeCount - skip);

        const activeTickets = await prisma.supportTicket.findMany({
          where: activeWhere,
          skip: skip,
          take: takeActive,
          include,
          orderBy: { created_at: "desc" },
        });

        tickets.push(...activeTickets);

        // If we need more to fill 'take', fetch from resolved
        if (tickets.length < take) {
          const remainingTake = take - tickets.length;
          const resolvedTickets = await prisma.supportTicket.findMany({
            where: resolvedWhere,
            skip: 0, // Start from the top of resolved list
            take: remainingTake,
            include,
            orderBy: { created_at: "desc" }, // Most recently created resolved tickets first
          });
          tickets.push(...resolvedTickets);
        }
      } else {
        // We are past the active range, fetch entirely from resolved
        const resolvedSkip = skip - activeCount;

        const resolvedTickets = await prisma.supportTicket.findMany({
          where: resolvedWhere,
          skip: resolvedSkip,
          take,
          include,
          orderBy: { created_at: "desc" },
        });

        tickets.push(...resolvedTickets);
      }
    }

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
    } else if (status === "OPEN" || status === "IN_PROGRESS") {
      updateData.resolvedAt = null;
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
