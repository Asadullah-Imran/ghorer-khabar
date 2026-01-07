import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";

export async function POST() {
  try {
    // First, get or create a test user (seller)
    let user = await prisma.user.findFirst({
      where: { role: "SELLER" },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: "test-seller-" + Date.now(),
          email: "testseller@example.com",
          name: "Test Seller",
          role: "SELLER",
          password: "hashed_password_here",
        },
      });
    }

    // Create a test kitchen
    const kitchen = await prisma.kitchens.create({
      data: {
        sellerId: user.id,
        name: "Test Kitchen",
        description: "A test kitchen for development",
        location: "Dhaka",
        area: "Gulshan",
        onboardingCompleted: true,
        isVerified: true,
        isActive: true,
        isOpen: true,
      },
    });

    // Create a sample menu item for testing subscriptions
    const menuItem = await prisma.menu_items.create({
      data: {
        id: "test-dish-" + Date.now(),
        chef_id: user.id,
        name: "Chicken Curry",
        description: "Delicious homemade chicken curry",
        category: "Main Course",
        price: 250,
        prepTime: 30,
        isVegetarian: false,
        isAvailable: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Test kitchen and menu item created successfully!",
      kitchen: {
        id: kitchen.id,
        name: kitchen.name,
      },
      menuItem: {
        id: menuItem.id,
        name: menuItem.name,
      },
      instructions: [
        `1. Update your .env file: TEMP_KITCHEN_ID="${kitchen.id}"`,
        `2. Restart your dev server`,
        `3. Use dishId "${menuItem.id}" in your subscription schedule`,
      ],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
