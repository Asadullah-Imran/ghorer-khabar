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
        { error: "Only sellers can access inventory" },
        { status: 403 },
      ),
    };
  }

  return { userId };
}

export async function GET() {
  try {
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;

    const items = await prisma.inventory_items.findMany({
      where: { chef_id: auth.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;

    const body = await req.json();
    const {
      name,
      unit,
      currentStock, // This is now the stock to add (initial stock for new items)
      stockToAdd, // Alternative field name
      unitCost = 0,
    } = body || {};

    if (!name || !unit) {
      return NextResponse.json(
        { error: "Name and unit are required" },
        { status: 400 },
      );
    }

    // Use stockToAdd if provided, otherwise use currentStock (for backward compatibility)
    const initialStock = Number(stockToAdd ?? currentStock) || 0;

    const item = await prisma.inventory_items.create({
      data: {
        chef_id: auth.userId,
        name: String(name),
        unit: String(unit),
        currentStock: initialStock,
        demandFromOrders: 0, // Will be calculated from orders
        forecastDemand: 0, // Will be calculated from forecast
        reorderLevel: 0, // Should be set separately
        unitCost: Number(unitCost) || 0,
      },
    });

    return NextResponse.json(
      { success: true, data: item },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return NextResponse.json(
      { error: "Failed to create inventory item" },
      { status: 500 },
    );
  }
}
