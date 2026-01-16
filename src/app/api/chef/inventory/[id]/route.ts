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

async function getOwnedItem(id: string, userId: string) {
  const item = await prisma.inventory_items.findUnique({ where: { id } });
  if (!item) {
    return { error: NextResponse.json({ error: "Inventory item not found" }, { status: 404 }) };
  }
  if (item.chef_id !== userId) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { item };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;

    const owned = await getOwnedItem(id, auth.userId!);
    if (owned.error) return owned.error;

    return NextResponse.json({ success: true, data: owned.item });
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory item" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;

    const owned = await getOwnedItem(id, auth.userId!);
    if (owned.error) return owned.error;

    const body = await req.json();
    const {
      name,
      unit,
      currentStock,
      demandFromOrders,
      forecastDemand,
      reorderLevel,
      unitCost,
    } = body || {};

    const data: Record<string, any> = {};
    if (name !== undefined) data.name = String(name);
    if (unit !== undefined) data.unit = String(unit);
    if (currentStock !== undefined) data.currentStock = Number(currentStock) || 0;
    if (demandFromOrders !== undefined) data.demandFromOrders = Number(demandFromOrders) || 0;
    if (forecastDemand !== undefined) data.forecastDemand = Number(forecastDemand) || 0;
    if (reorderLevel !== undefined) data.reorderLevel = Number(reorderLevel) || 0;
    if (unitCost !== undefined) data.unitCost = Number(unitCost) || 0;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    const updated = await prisma.inventory_items.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    return NextResponse.json(
      { error: "Failed to update inventory item" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;

    const owned = await getOwnedItem(id, auth.userId!);
    if (owned.error) return owned.error;

    await prisma.inventory_items.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Inventory item deleted" });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory item" },
      { status: 500 },
    );
  }
}
