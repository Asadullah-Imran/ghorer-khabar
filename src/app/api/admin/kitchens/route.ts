import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "10");
    const search = searchParams.get("search");

    const where: any = { seller: { role: "SELLER" } };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { seller: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [kitchens, total] = await Promise.all([
      prisma.kitchen.findMany({
        where,
        skip,
        take,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.kitchen.count({ where }),
    ]);

    return NextResponse.json({ kitchens, total });
  } catch (error) {
    console.error("Error fetching kitchens:", error);
    return NextResponse.json(
      { error: "Failed to fetch kitchens" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { kitchenId, isVerified, onboardingCompleted } = body;

    const kitchen = await prisma.kitchen.update({
      where: { id: kitchenId },
      data: {
        isVerified,
        onboardingCompleted,
      },
      include: { seller: true },
    });

    return NextResponse.json(kitchen);
  } catch (error) {
    console.error("Error updating kitchen:", error);
    return NextResponse.json(
      { error: "Failed to update kitchen" },
      { status: 500 }
    );
  }
}
