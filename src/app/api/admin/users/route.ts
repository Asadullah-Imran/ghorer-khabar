import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "10");
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const top = searchParams.get("top"); // "buyer" | "seller"

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // If requesting top sellers or buyers, compute based on aggregates
    if (top === "seller") {
      // Aggregate across kitchens by sellerId, order by totalRevenue desc
      const topSellerAgg = await prisma.kitchen.groupBy({
        by: ["sellerId"],
        _sum: { totalRevenue: true, totalOrders: true },
        orderBy: { _sum: { totalRevenue: "desc" } },
        take,
      });

      const sellerIds = topSellerAgg.map((s) => s.sellerId);
      let users = await prisma.user.findMany({
        where: { id: { in: sellerIds } },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          emailVerified: true,
          avatar: true,
          phone: true,
        },
      });
      // Preserve ranking order
      const orderMap = new Map(sellerIds.map((id, idx) => [id, idx]));
      users = users.sort((a, b) => (orderMap.get(a.id)! - orderMap.get(b.id)!));

      // Apply optional search filter client-side here
      if (search) {
        const s = search.toLowerCase();
        users = users.filter(
          (u) =>
            (u.name || "").toLowerCase().includes(s) ||
            (u.email || "").toLowerCase().includes(s)
        );
      }

      return NextResponse.json({ users, total: users.length });
    }

    if (top === "buyer") {
      // Aggregate orders by userId on COMPLETED orders
      const topBuyerAgg = await prisma.order.groupBy({
        by: ["userId"],
        where: { status: "COMPLETED" },
        _sum: { total: true },
        _count: true,
        orderBy: { _sum: { total: "desc" } },
        take,
      });

      const buyerIds = topBuyerAgg.map((b) => b.userId);
      let users = await prisma.user.findMany({
        where: { id: { in: buyerIds } },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          emailVerified: true,
          avatar: true,
          phone: true,
        },
      });
      const orderMap = new Map(buyerIds.map((id, idx) => [id, idx]));
      users = users.sort((a, b) => (orderMap.get(a.id)! - orderMap.get(b.id)!));

      if (search) {
        const s = search.toLowerCase();
        users = users.filter(
          (u) =>
            (u.name || "").toLowerCase().includes(s) ||
            (u.email || "").toLowerCase().includes(s)
        );
      }

      return NextResponse.json({ users, total: users.length });
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          emailVerified: true,
          avatar: true,
          phone: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, total });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, ...updateData } = body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
