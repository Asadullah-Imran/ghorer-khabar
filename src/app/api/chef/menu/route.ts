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

    const menuItems = await prisma.menuItem.findMany({
      where: { chefId: user.id },
      include: {
        ingredients: {
          select: { id: true, name: true, quantity: true, unit: true, cost: true },
        },
        images: {
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

    if (!name || !category || !price) {
      return NextResponse.json(
        { error: "Name, category, and price are required" },
        { status: 400 }
      );
    }

    // Upload images to Supabase
    const imageUrls: { url: string; order: number }[] = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (!file || file.size === 0) continue;

      const uploadResult = await imageService.uploadImage(file, "chef-menu");
      if (uploadResult.success && uploadResult.url) {
        imageUrls.push({ url: uploadResult.url, order: i });
      }
    }

    // Create menu item
    const menuItem = await prisma.menuItem.create({
      data: {
        chefId: user.id,
        name,
        description,
        category,
        price,
        prepTime,
        calories,
        spiciness,
        isVegetarian,
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
        images: {
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
        images: {
          orderBy: { order: "asc" },
          select: { id: true, imageUrl: true, order: true },
        },
      },
    });

    return NextResponse.json(
      { success: true, message: "Menu item created successfully", data: menuItem },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}
