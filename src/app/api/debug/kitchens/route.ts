import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";

export async function GET() {
  try {
    const kitchens = await prisma.kitchen.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        sellerId: true,
      },
    });

    return NextResponse.json({
      success: true,
      kitchens,
      message: kitchens.length === 0 
        ? "No kitchens found. Create one first." 
        : `Update .env with: TEMP_KITCHEN_ID="${kitchens[0].id}"`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
