import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth/getAuthUser";

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "1000"); // Increased for better filtering
    const search = searchParams.get("search");
    const chefId = searchParams.get("chefId");
    const category = searchParams.get("category");
    const sortBy = searchParams.get("sortBy") || "createdAt";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (chefId) {
      where.chef_id = chefId;
    }

    if (category) {
      where.category = category;
    }

    // Determine sorting based on sortBy parameter
    let orderBy: any = { createdAt: "desc" };
    
    if (sortBy === "rating") {
      orderBy = { rating: "desc" };
    } else if (sortBy === "reviewCount") {
      orderBy = { reviewCount: "desc" };
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
          _count: {
            select: {
              orderItems: true,
              favorites: true,
            },
          },
        },
        orderBy,
      }),
      prisma.menu_items.count({ where }),
    ]);

    // Sort by sales or favorites if requested (client-side sorting for aggregated counts)
    let sortedMenuItems = menuItems;
    if (sortBy === "sales") {
      sortedMenuItems = menuItems.sort((a, b) => (b._count?.orderItems || 0) - (a._count?.orderItems || 0));
    } else if (sortBy === "favorites") {
      sortedMenuItems = menuItems.sort((a, b) => (b._count?.favorites || 0) - (a._count?.favorites || 0));
    }

    return NextResponse.json({ menuItems: sortedMenuItems, total });
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
    // Verify authentication
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { menuItemId, isAvailable } = body;

    // Validate required fields
    if (!menuItemId) {
      return NextResponse.json(
        { error: "Menu item ID is required" },
        { status: 400 }
      );
    }

    if (typeof isAvailable !== "boolean") {
      return NextResponse.json(
        { error: "isAvailable must be a boolean value" },
        { status: 400 }
      );
    }

    // Update only the isAvailable field
    const menuItem = await prisma.menu_items.update({
      where: { id: menuItemId },
      data: { 
        isAvailable,
        updatedAt: new Date()
      },
      include: { 
        users: {
          select: {
            id: true,
            name: true,
          }
        }, 
        menu_item_images: true 
      },
    });

    return NextResponse.json({ 
      success: true,
      menuItem 
    });
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
    // Verify authentication
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

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
