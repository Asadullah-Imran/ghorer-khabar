import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "10");
    const search = searchParams.get("search");

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [menuItems, total] = await Promise.all([
      prisma.menu_items.findMany({
        where,
        skip,
        take,
        include: {
          users: {
            select: {
              id: true,
              name: true,
            },
          },
          menu_item_images: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.menu_items.count({ where }),
    ]);

    return NextResponse.json({ menuItems, total });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { menuItemId, ...updateData } = body;

    const menuItem = await prisma.menu_items.update({
      where: { id: menuItemId },
      data: updateData,
      include: { users: true, menu_item_images: true },
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const menuItemId = searchParams.get("id");

    if (!menuItemId) {
      return NextResponse.json(
        { error: "Menu item ID required" },
        { status: 400 }
      );
    }

    // Delete related order items first (cascade delete)
    await prisma.orderItem.deleteMany({
      where: { menuItemId },
    });

    // Delete related menu item images
    await prisma.menu_item_images.deleteMany({
      where: { menu_item_id: menuItemId },
    });

    // Finally delete the menu item
    await prisma.menu_items.delete({
      where: { id: menuItemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
