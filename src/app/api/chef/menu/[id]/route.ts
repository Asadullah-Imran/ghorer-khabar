import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { imageService } from "@/services/image.service";
import { createClient } from "@/lib/supabase/server";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

/**
 * GET /api/chef/menu/[id]
 * Get a specific menu item with ingredients and images
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let userId: string | undefined;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (user && !authError) {
      userId = user.id;
    } else {
      // Fallback to JWT token from cookie
      const cookieStore = await cookies();
      const token = cookieStore.get("auth_token")?.value;
      if (token) {
        const decoded = verifyToken(token);
        if (decoded && typeof decoded === "object" && "userId" in decoded) {
          userId = (decoded as any).userId;
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch menu item with ingredients and images
    const menuItem = await prisma.menu_items.findUnique({
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
        menu_item_images: {
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
    if (menuItem.chef_id !== userId) {
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
    console.log("\n=== BACKEND: PUT /api/chef/menu/[id] STARTED ===");
    let userId: string | undefined;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (user && !authError) {
      userId = user.id;
      console.log("Authenticated via Supabase. User ID:", userId);
    } else {
      // Fallback to JWT token from cookie
      const cookieStore = await cookies();
      const token = cookieStore.get("auth_token")?.value;
      if (token) {
        const decoded = verifyToken(token);
        if (decoded && typeof decoded === "object" && "userId" in decoded) {
          userId = (decoded as any).userId;
          console.log("Authenticated via JWT token. User ID:", userId);
        }
      }
    }

    if (!userId) {
      console.log("Auth error - user not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Authenticated user ID:", userId);

    // Check if user exists in database and has SELLER role
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      console.log("User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (dbUser.role !== "SELLER") {
      console.log("User role is", dbUser.role, "- only SELLER can access chef endpoints");
      return NextResponse.json(
        { error: "Only sellers can access chef menu" },
        { status: 403 }
      );
    }

    console.log("User is SELLER - authorized");

    const { id } = await params;
    console.log("Menu item ID:", id);

    // Check if menu item exists and belongs to user
    const existingItem = await prisma.menu_items.findUnique({
      where: { id },
      include: { menu_item_images: true },
    });

    if (!existingItem) {
      console.log("Menu item not found with ID:", id);
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    if (existingItem.chef_id !== userId) {
      console.log("Menu item does not belong to user");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse form data or JSON
    const contentType = req.headers.get("content-type") || "";
    console.log("Content-Type:", contentType);
    
    let updateData: any = {};
    let imageFiles: File[] = [];
    let imagesToDelete: string[] = [];

    if (contentType.includes("application/json")) {
      console.log("Parsing JSON body");
      updateData = await req.json();
      console.log("Update data from JSON:", updateData);
    } else if (contentType.includes("multipart/form-data")) {
      console.log("Parsing FormData body");
      const formData = await req.formData();
      imageFiles = formData.getAll("images") as File[];
      imagesToDelete = formData.getAll("deleteImages") as any;
      const allergyAlertsJson = formData.get("allergyAlerts") as string;
      const allergyAlerts = allergyAlertsJson ? JSON.parse(allergyAlertsJson).filter((alert: string) => alert.trim() !== "") : [];
      
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
        allergyAlerts: allergyAlerts.length > 0 ? allergyAlerts : [],
      };
      console.log("Update data from FormData:", updateData);
      console.log("Images to upload:", imageFiles.length);
      console.log("Images to delete:", imagesToDelete);
    }

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );
    console.log("Final update data (after removing undefined):", updateData);

    // Delete old images if requested
    if (imagesToDelete.length > 0) {
      console.log("Deleting", imagesToDelete.length, "images");
      for (const imageId of imagesToDelete) {
        const image = existingItem.menu_item_images.find((img) => img.id === imageId);
        if (image) {
          console.log("Deleting image:", imageId, image.imageUrl);
          await imageService.deleteImage(image.imageUrl);
          await prisma.menu_item_images.delete({
            where: { id: imageId },
          });
        }
      }
    }

    // Upload new images if provided
    if (imageFiles.length > 0) {
      console.log("Uploading", imageFiles.length, "new images");
      const currentImageCount = await prisma.menu_item_images.count({
        where: { menu_item_id: id },
      });
      console.log("Current image count:", currentImageCount);

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        if (!file || file.size === 0) {
          console.log(`Skipping image ${i} - empty file`);
          continue;
        }

        console.log(`Uploading image ${i}:`, { name: file.name, size: file.size });
        const uploadResult = await imageService.uploadImage(file, "chef-menu");
        if (uploadResult.success && uploadResult.url) {
          console.log(`Image ${i} uploaded:`, uploadResult.url);
          await prisma.menu_item_images.create({
            data: {
              menu_item_id: id,
              imageUrl: uploadResult.url,
              order: currentImageCount + i,
            },
          });
        } else {
          console.error(`Image ${i} upload failed:`, uploadResult.error);
        }
      }
    }

    // Handle ingredients if provided
    let ingredientData: any = {};
    if (updateData.ingredients) {
      console.log("Updating ingredients");
      const ingredients = updateData.ingredients;
      delete updateData.ingredients;

      // Delete existing ingredients
      console.log("Deleting existing ingredients");
      await prisma.ingredients.deleteMany({
        where: { menu_item_id: id },
      });

      // Create new ingredients
      console.log("Creating new ingredients:", ingredients);
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
    console.log("Updating menu item in database");
    const updatedItem = await prisma.menu_items.update({
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
        menu_item_images: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            imageUrl: true,
            order: true,
          },
        },
      },
    });

    console.log("Menu item updated successfully:", {
      id: updatedItem.id,
      name: updatedItem.name,
      ingredientsCount: updatedItem.ingredients.length,
      imagesCount: updatedItem.menu_item_images.length,
    });
    console.log("=== BACKEND: PUT /api/chef/menu/[id] COMPLETED ===\n");

    return NextResponse.json({
      success: true,
      message: "Menu item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    console.error("=== BACKEND: PUT Error updating menu item ===", error);
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
    console.log("\n=== BACKEND: DELETE /api/chef/menu/[id] STARTED ===");
    let userId: string | undefined;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (user && !authError) {
      userId = user.id;
      console.log("Authenticated via Supabase. User ID:", userId);
    } else {
      // Fallback to JWT token from cookie
      const cookieStore = await cookies();
      const token = cookieStore.get("auth_token")?.value;
      if (token) {
        const decoded = verifyToken(token);
        if (decoded && typeof decoded === "object" && "userId" in decoded) {
          userId = (decoded as any).userId;
          console.log("Authenticated via JWT token. User ID:", userId);
        }
      }
    }

    if (!userId) {
      console.log("Auth error - user not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Authenticated user ID:", userId);

    // Check if user exists in database and has SELLER role
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      console.log("User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (dbUser.role !== "SELLER") {
      console.log("User role is", dbUser.role, "- only SELLER can access chef endpoints");
      return NextResponse.json(
        { error: "Only sellers can access chef menu" },
        { status: 403 }
      );
    }

    console.log("User is SELLER - authorized");

    const { id } = await params;
    console.log("Deleting menu item ID:", id);

    // Check if menu item exists and belongs to user
    const menuItem = await prisma.menu_items.findUnique({
      where: { id },
      include: { menu_item_images: true },
    });

    if (!menuItem) {
      console.log("Menu item not found with ID:", id);
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    if (menuItem.chef_id !== userId) {
      console.log("Menu item does not belong to user");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("Menu item found. Images to delete:", menuItem.menu_item_images.length);

    // Delete all images from Supabase
    for (const image of menuItem.menu_item_images) {
      console.log("Deleting image from Supabase:", image.imageUrl);
      await imageService.deleteImage(image.imageUrl);
    }

    // Delete menu item (cascades to ingredients and images)
    console.log("Deleting menu item from database");
    await prisma.menu_items.delete({
      where: { id },
    });

    console.log("Menu item deleted successfully");
    console.log("=== BACKEND: DELETE /api/chef/menu/[id] COMPLETED ===\n");

    return NextResponse.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("=== BACKEND: DELETE Error deleting menu item ===", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
