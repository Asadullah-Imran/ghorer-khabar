import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

/**
 * POST /api/chef/menu/test
 * Create a test menu item (for testing without authentication)
 * 
 * This endpoint is for testing ONLY and should be removed in production
 */
export async function POST(req: NextRequest) {
  try {
    console.log("Test endpoint called - starting database operation");
    
    // WARNING: This is a test endpoint. Remove in production!
    // For testing, use a hardcoded test chef ID
    const testChefId = "test-chef-id-12345";

    // Ensure test user exists
    await prisma.user.upsert({
      where: { id: testChefId },
      update: {},
      create: {
        id: testChefId,
        email: "testchef@example.com",
        name: "Test Chef",
        role: "SELLER",
        emailVerified: true,
      },
    });

    // Parse request body
    const body = await req.json();
    console.log("Request body parsed:", body);
    
    const {
      name = "Test Dish",
      description = "A delicious test dish",
      category = "Rice",
      price = 450,
      prepTime = 20,
      calories = 350,
      spiciness = "Medium",
      isVegetarian = false,
      ingredients = [
        { name: "Rice", quantity: 200, unit: "gm", cost: 50 },
        { name: "Vegetables", quantity: 100, unit: "gm", cost: 30 }
      ]
    } = body;

    console.log("Creating menu item with name:", name);

    // Create menu item with test data
    const menuItem = await prisma.menu_items.create({
      data: {
        chef_id: testChefId,
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
              quantity: typeof ing.quantity === 'string' ? parseFloat(ing.quantity) : ing.quantity,
              unit: ing.unit,
              cost: typeof ing.cost === 'string' ? parseFloat(ing.cost) : ing.cost,
            })),
          },
        },
        menu_item_images: {
          createMany: {
            data: [
              {
                imageUrl: "https://via.placeholder.com/400x300?text=" + encodeURIComponent(name),
                order: 0,
              },
            ],
          },
        },
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

    console.log("Menu item created successfully:", menuItem.id);

    return NextResponse.json(
      {
        success: true,
        message: "Test menu item created successfully",
        data: menuItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating test menu item:", error);
    return NextResponse.json(
      { error: "Failed to create test menu item", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chef/menu/test
 * Get all menu items for test chef (for testing without authentication)
 */
export async function GET(req: NextRequest) {
  try {
    const testChefId = "59afae3f-9421-4c52-b287-f86147d1303d";

    const menuItems = await prisma.menu_items.findMany({
      where: { chef_id: testChefId },
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: menuItems,
      count: menuItems.length,
    });
  } catch (error) {
    console.error("Error fetching test menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch test menu items", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chef/menu/test/:id
 * Delete a test menu item
 */
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Menu item ID is required" },
        { status: 400 }
      );
    }

    const testChefId = "test-chef-id-12345";

    // Verify it belongs to test chef
    const menuItem = await prisma.menu_items.findFirst({
      where: { id, chef_id: testChefId },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    // Delete the menu item
    await prisma.menu_items.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting test menu item:", error);
    return NextResponse.json(
      { error: "Failed to delete test menu item", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/chef/menu/test
 * Update a test menu item
 */
export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Menu item ID is required" },
        { status: 400 }
      );
    }

    const testChefId = "test-chef-id-12345";

    // Verify it belongs to test chef
    const menuItem = await prisma.menu_items.findFirst({
      where: { id, chef_id: testChefId },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Update the menu item
    const updatedItem = await prisma.menu_items.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.category && { category: body.category }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.prepTime !== undefined && { prepTime: body.prepTime }),
        ...(body.calories !== undefined && { calories: body.calories }),
        ...(body.spiciness && { spiciness: body.spiciness }),
        ...(body.isVegetarian !== undefined && { isVegetarian: body.isVegetarian }),
        ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable }),
      },
      include: {
        ingredients: true,
        menu_item_images: { orderBy: { order: 'asc' } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Menu item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error updating test menu item:", error);
    return NextResponse.json(
      { error: "Failed to update test menu item", details: String(error) },
      { status: 500 }
    );
  }
}
