import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Normalize and validate status to avoid case mismatches breaking filters
    const allowedStatuses = new Set([
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "DELIVERING",
      "COMPLETED",
      "CANCELLED",
    ]);
    const normalizedStatus = status?.toUpperCase();

    const where: any = {};
    if (normalizedStatus && allowedStatuses.has(normalizedStatus)) {
      where.status = normalizedStatus;
    }
    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
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
          kitchen: {
            select: {
              id: true,
              name: true,
            },
          },
          items: {
            include: {
              menuItem: {
                select: {
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: true,
        kitchen: true,
        items: true,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
