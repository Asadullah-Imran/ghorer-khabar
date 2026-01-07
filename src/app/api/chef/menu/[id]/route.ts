import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { imageService } from "@/services/image.service";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/chef/menu/[id]
 * Get a specific menu item with ingredients and images
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch menu item with ingredients and images
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        ingredients: {
          select: {
            id: true,
            name: true,
            quantity: true,
            unit: true,
            cost: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            imageUrl: true,
            order: true,
          },
        },
      },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (menuItem.chefId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error("Error fetching menu item:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu item" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/chef/menu/[id]
 * Update a menu item with images
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("\n=== BACKEND: PUT /api/chef/menu/[id] started ===");
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("BACKEND: Auth error - user not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("BACKEND: Authenticated user ID:", user.id);

    // Check if user exists in database and has SELLER role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      console.log("BACKEND: User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (dbUser.role !== "SELLER") {
      console.log("BACKEND: User role is", dbUser.role, "- only SELLER can access chef endpoints");
      return NextResponse.json(
        { error: "Only sellers can access chef menu" },
        { status: 403 }
      );
    }

    console.log("BACKEND: User is SELLER - authorized");

    const { id } = await params;

    // Check if menu item exists and belongs to user
    const existingItem = await prisma.menuItem.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    if (existingItem.chefId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse form data or JSON
    const contentType = req.headers.get("content-type") || "";
    let updateData: any = {};
    let imageFiles: File[] = [];
    let imagesToDelete: string[] = [];

    if (contentType.includes("application/json")) {
      updateData = await req.json();
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      imageFiles = formData.getAll("images") as File[];
      imagesToDelete = formData.getAll("deleteImages") as any;
      updateData = {
        name: formData.get("name"),
        description: formData.get("description"),
        category: formData.get("category"),
        price: formData.get("price")
          ? parseFloat(formData.get("price") as string)
          : undefined,
        prepTime: formData.get("prepTime")
          ? parseInt(formData.get("prepTime") as string)
          : undefined,
        calories: formData.get("calories")
          ? parseInt(formData.get("calories") as string)
          : undefined,
        spiciness: formData.get("spiciness"),
        isVegetarian: formData.get("isVegetarian") === "true",
      };
    }

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // Delete old images if requested
    if (imagesToDelete.length > 0) {
      for (const imageId of imagesToDelete) {
        const image = existingItem.images.find((img) => img.id === imageId);
        if (image) {
          await imageService.deleteImage(image.imageUrl);
          await prisma.menuItemImage.delete({
            where: { id: imageId },
          });
        }
      }
    }

    // Upload new images if provided
    if (imageFiles.length > 0) {
      const currentImageCount = await prisma.menuItemImage.count({
        where: { menuItemId: id },
      });

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        if (!file || file.size === 0) continue;

        const uploadResult = await imageService.uploadImage(file, "chef-menu");
        if (uploadResult.success && uploadResult.url) {
          await prisma.menuItemImage.create({
            data: {
              menuItemId: id,
              imageUrl: uploadResult.url,
              order: currentImageCount + i,
            },
          });
        }
      }
    }

    // Handle ingredients if provided
    let ingredientData: any = {};
    if (updateData.ingredients) {
      const ingredients = updateData.ingredients;
      delete updateData.ingredients;

      // Delete existing ingredients
      await prisma.ingredient.deleteMany({
        where: { menuItemId: id },
      });

      // Create new ingredients
      ingredientData = {
        ingredients: {
          createMany: {
            data: ingredients.map((ing: any) => ({
              name: ing.name,
              quantity: typeof ing.quantity === 'string' ? parseFloat(ing.quantity) : ing.quantity,
              unit: ing.unit,
              cost: typeof ing.cost === 'string' ? parseFloat(ing.cost) : (ing.cost || 0),
            })),
          },
        },
      };
    }

    // Update menu item
    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        ...updateData,
        ...ingredientData,
      },
      include: {
        ingredients: {
          select: {
            id: true,
            name: true,
            quantity: true,
            unit: true,
            cost: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            imageUrl: true,
            order: true,
          },
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
 * Delete a menu item and all its images
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("\n=== BACKEND: DELETE /api/chef/menu/[id] started ===");
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("BACKEND: Auth error - user not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("BACKEND: Authenticated user ID:", user.id);

    // Check if user exists in database and has SELLER role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      console.log("BACKEND: User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (dbUser.role !== "SELLER") {
      console.log("BACKEND: User role is", dbUser.role, "- only SELLER can access chef endpoints");
      return NextResponse.json(
        { error: "Only sellers can access chef menu" },
        { status: 403 }
      );
    }

    console.log("BACKEND: User is SELLER - authorized");

    const { id } = await params;

    // Check if menu item exists and belongs to user
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    if (menuItem.chefId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete all images from Supabase
    for (const image of menuItem.images) {
      await imageService.deleteImage(image.imageUrl);
    }

    // Delete menu item (cascades to ingredients and images)
    await prisma.menuItem.delete({
      where: { id },
    });

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
