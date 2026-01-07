import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { imageService } from "@/services/image.service";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/chef/menu
 * Fetch all menu items for a chef
 */
export async function GET(req: NextRequest) {
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

    const menuItems = await prisma.menu_items.findMany({
      where: { chef_id: user.id },
      include: {
        ingredients: {
          select: { id: true, name: true, quantity: true, unit: true, cost: true },
        },
        menu_item_images: {
          orderBy: { order: "asc" },
          select: { id: true, imageUrl: true, order: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: menuItems });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chef/menu
 * Create a new menu item with images
 */
export async function POST(req: NextRequest) {
  try {
    console.log("\n=== BACKEND: POST /api/chef/menu STARTED ===");
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("Auth error - User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Authenticated user ID:", user.id);
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "SELLER") {
      console.log("User is not a SELLER. Role:", dbUser?.role);
      return NextResponse.json(
        { error: "Only sellers can access chef menu" },
        { status: 403 }
      );
    }

    console.log("User role verified: SELLER");
    const formData = await req.formData();
    const imageFiles = formData.getAll("images") as File[];
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const price = parseFloat(formData.get("price") as string);
    const prepTime = formData.get("prepTime") ? parseInt(formData.get("prepTime") as string) : null;
    const calories = formData.get("calories") ? parseInt(formData.get("calories") as string) : null;
    const spiciness = formData.get("spiciness") as string;
    const isVegetarian = formData.get("isVegetarian") === "true";
    const ingredientsJson = formData.get("ingredients") as string;
    const ingredients = ingredientsJson ? JSON.parse(ingredientsJson) : [];

    console.log("FormData received:", {
      name,
      description,
      category,
      price,
      prepTime,
      calories,
      spiciness,
      isVegetarian,
      imageFilesCount: imageFiles.length,
      ingredientsCount: ingredients.length,
    });
    console.log("Ingredients from form:", ingredients);

    if (!name || !category || !price) {
      console.log("Validation failed - missing required fields");
      return NextResponse.json(
        { error: "Name, category, and price are required" },
        { status: 400 }
      );
    }

    // Upload images to Supabase
    console.log("Starting image upload...");
    const imageUrls: { url: string; order: number }[] = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (!file || file.size === 0) {
        console.log(`Skipping image ${i} - empty file`);
        continue;
      }

      console.log(`Uploading image ${i}:`, { name: file.name, size: file.size, type: file.type });
      const uploadResult = await imageService.uploadImage(file, "chef-menu");
      if (uploadResult.success && uploadResult.url) {
        console.log(`Image ${i} uploaded successfully:`, uploadResult.url);
        imageUrls.push({ url: uploadResult.url, order: i });
      } else {
        console.error(`Image ${i} upload failed:`, uploadResult.error);
      }
    }

    console.log("Total images uploaded:", imageUrls.length);

    // Create menu item
    console.log("Creating menu item in database...");
    const menuItem = await prisma.menu_items.create({
      data: {
        chef_id: user.id,
        name,
        description,
        category,
        price,
        prepTime,
        calories,
        spiciness,
        isVegetarian,
        updatedAt: new Date(),
        ingredients: {
          createMany: {
            data: ingredients.map((ing: any) => ({
              name: ing.name,
              quantity: typeof ing.quantity === "string" ? parseFloat(ing.quantity) : ing.quantity,
              unit: ing.unit,
              cost: typeof ing.cost === "string" ? parseFloat(ing.cost) : (ing.cost || 0),
            })),
          },
        },
        menu_item_images: {
          createMany: {
            data: imageUrls.map((img) => ({
              imageUrl: img.url,
              order: img.order,
            })),
          },
        },
      },
      include: {
        ingredients: {
          select: { id: true, name: true, quantity: true, unit: true, cost: true },
        },
        menu_item_images: {
          orderBy: { order: "asc" },
          select: { id: true, imageUrl: true, order: true },
        },
      },
    });

    console.log("Menu item created successfully:", {
      id: menuItem.id,
      name: menuItem.name,
      ingredientsCount: menuItem.ingredients.length,
      imagesCount: menuItem.menu_item_images.length,
    });
    console.log("Full menu item response:", menuItem);
    console.log("=== BACKEND: POST /api/chef/menu COMPLETED ===\n");

    return NextResponse.json(
      { success: true, message: "Menu item created successfully", data: menuItem },
      { status: 201 }
    );
  } catch (error) {
    console.error("=== BACKEND: POST Error creating menu item ===", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}
