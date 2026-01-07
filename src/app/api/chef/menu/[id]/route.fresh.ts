import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { imageService } from "@/services/image.service";
import { createClient } from "@/lib/supabase/server";

/**
 * PUT /api/chef/menu/[id]
 * Update a menu item
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "SELLER") {
      return NextResponse.json(
        { error: "Only sellers can access chef menu" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const existingItem = await prisma.menuItem.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    if (existingItem.chefId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Handle JSON updates (for availability toggle, etc.)
    const contentType = req.headers.get("content-type") || "";
    let updateData: any = {};

    if (contentType.includes("application/json")) {
      updateData = await req.json();
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: updateData,
      include: {
        ingredients: {
          select: { id: true, name: true, quantity: true, unit: true, cost: true },
        },
        images: {
          orderBy: { order: "asc" },
          select: { id: true, imageUrl: true, order: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Menu item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chef/menu/[id]
 * Delete a menu item
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "SELLER") {
      return NextResponse.json(
        { error: "Only sellers can access chef menu" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!menuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    if (menuItem.chefId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete images from Supabase
    for (const image of menuItem.images) {
      await imageService.deleteImage(image.imageUrl);
    }

    // Delete menu item (cascades to ingredients and images DB records)
    await prisma.menuItem.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
