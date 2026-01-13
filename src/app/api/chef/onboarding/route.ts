import prisma from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { chefOnboardingSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = chefOnboardingSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { kitchens: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has a kitchen (prevent duplicate onboarding)
    if (existingUser.kitchens.length > 0) {
      return NextResponse.json(
        { error: "You have already completed onboarding" },
        { status: 400 }
      );
    }

    // Check if user has SELLER role
    if (existingUser.role !== "SELLER") {
      return NextResponse.json(
        { error: "Only sellers can create kitchens" },
        { status: 403 }
      );
    }

    // Create address for kitchen location
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: "Kitchen Location",
        address: validatedData.address,
        zone: validatedData.zone,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        isDefault: true,
      },
    });

    // Create kitchen
    const kitchen = await prisma.kitchen.create({
      data: {
        sellerId: user.id,
        name: validatedData.kitchenName,
        location: validatedData.address,
        area: validatedData.zone,
        nidName: validatedData.nidName,
        nidFrontImage: validatedData.nidFrontImage,
        nidBackImage: validatedData.nidBackImage,
        coverImage: validatedData.kitchenImages[0] || null,
        onboardingCompleted: true,
        isVerified: false, // Pending admin verification
        isActive: false, // Inactive until verified
      },
    });

    // Create kitchen gallery images
    if (validatedData.kitchenImages.length > 0) {
      await prisma.kitchenGallery.createMany({
        data: validatedData.kitchenImages.map((imageUrl, index) => ({
          kitchenId: kitchen.id,
          imageUrl,
          order: index,
        })),
      });
    }

    // Update user's phone number
    await prisma.user.update({
      where: { id: user.id },
      data: { phone: validatedData.phone },
    });

    return NextResponse.json({
      success: true,
      kitchen: {
        id: kitchen.id,
        name: kitchen.name,
        isVerified: kitchen.isVerified,
      },
    });
  } catch (error) {
    console.error("Chef onboarding error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid data provided" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
