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
    const take = parseInt(searchParams.get("take") || "10");
    const search = searchParams.get("search");
    const chefId = searchParams.get("chefId");
    const category = searchParams.get("category");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const includeStats = searchParams.get("includeStats") === "true";

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

    // Base query promises
    const queryPromises: any[] = [
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
    ];

    // If stats are requested, add them to the promise array
    if (includeStats) {
      // 1. Total items count (global)
      queryPromises.push(prisma.menu_items.count());

      // 2. Total available items (global)
      queryPromises.push(prisma.menu_items.count({ where: { isAvailable: true } }));

      // 3. All unique categories (global)
      queryPromises.push(prisma.menu_items.findMany({
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' }
      }));

      // 4. All unique chefs (global) - we need users who have menu items
      queryPromises.push(prisma.menu_items.findMany({
        select: {
          users: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        distinct: ['chef_id'],
      }));
    }

    const results = await Promise.all(queryPromises);

    const menuItems = results[0];
    const total = results[1];

    // Process stats if included
    let stats = null;
    let filters = null;

    if (includeStats) {
      const totalItems = results[2];
      const totalAvailable = results[3];
      const uniqueCategories = results[4].map((item: any) => item.category);
      const uniqueChefs = results[5].map((item: any) => item.users);

      stats = {
        totalItems,
        totalAvailable,
        totalCategories: uniqueCategories.length,
        activeChefs: uniqueChefs.length
      };

      filters = {
        categories: uniqueCategories,
        chefs: uniqueChefs
      };
    }

    // Sort by sales or favorites if requested (client-side sorting for aggregated counts)
    let sortedMenuItems = menuItems;
    if (sortBy === "sales") {
      sortedMenuItems = menuItems.sort((a: any, b: any) => (b._count?.orderItems || 0) - (a._count?.orderItems || 0));
    } else if (sortBy === "favorites") {
      sortedMenuItems = menuItems.sort((a: any, b: any) => (b._count?.favorites || 0) - (a._count?.favorites || 0));
    }

    return NextResponse.json({
      menuItems: sortedMenuItems,
      total,
      hasMore: skip + take < total,
      ...(stats && { stats }),
      ...(filters && { filters })
    });
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
