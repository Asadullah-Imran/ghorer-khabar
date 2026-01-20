import { verifyToken } from "@/lib/auth/jwt";
import { syncUserFromSupabase } from "@/lib/auth/syncUser";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { chefOnboardingSchema } from "@/lib/validation";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/chef/onboarding
 * Fetch the authenticated chef's kitchen information
 */
export async function GET() {
  try {
    // Get authenticated user
    const supabase = await createClient();
    let {
      data: { user },
    } = await supabase.auth.getUser();

    // If no Supabase session, check for custom JWT
    if (!user) {
      const cookieStore = await cookies();
      const token = cookieStore.get("auth_token")?.value;

      if (token) {
        const decoded = verifyToken(token);
        if (decoded && typeof decoded !== "string" && decoded.userId) {
          // Construct a user-like object from the JWT
          user = {
            id: decoded.userId as string,
            email: decoded.email,
            role: decoded.role,
            app_metadata: {},
            user_metadata: {},
            aud: "authenticated",
            created_at: new Date().toISOString(),
          } as any;
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the kitchen for this user
    const kitchen = await prisma.kitchen.findFirst({
      where: { sellerId: user.id },
      select: {
        id: true,
        name: true,
        isVerified: true,
        onboardingCompleted: true,
      },
    });

    if (!kitchen) {
      return NextResponse.json(
        { success: false, data: { kitchen: null } },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { kitchen },
    });
  } catch (error) {
    console.error("Error fetching chef onboarding data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    let {
      data: { user },
    } = await supabase.auth.getUser();

    // If no Supabase session, check for custom JWT
    if (!user) {
      const cookieStore = await cookies();
      const token = cookieStore.get("auth_token")?.value;

      if (token) {
        const decoded = verifyToken(token);
        if (decoded && typeof decoded !== "string" && decoded.userId) {
          // Construct a user-like object from the JWT
          user = {
            id: decoded.userId as string,
            email: decoded.email,
            role: decoded.role,
            app_metadata: {},
            user_metadata: {},
            aud: "authenticated",
            created_at: new Date().toISOString(),
          } as any;
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = chefOnboardingSchema.parse(body);

    // Check if user exists
    let existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { kitchens: true },
    });

    if (!existingUser) {
      // Try to sync from Supabase
      const syncedUser = await syncUserFromSupabase(user.id);
      if (syncedUser) {
          // Re-fetch to get relations
          existingUser = await prisma.user.findUnique({
              where: { id: syncedUser.id },
              include: { kitchens: true },
          });
      }
    }

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

    // Check if user has a default address
    const hasDefaultAddress = await prisma.address.findFirst({
      where: {
        userId: user.id,
        isDefault: true,
      },
    });

    // Create address for kitchen location
    // If user has no default address, make this their default
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: `Kitchen: ${validatedData.kitchenName}`,
        address: validatedData.address,
        zone: validatedData.zone,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        isDefault: !hasDefaultAddress, // Set as default if user has no default address
        isKitchenAddress: true, // Mark as kitchen address
      },
    });

    // Create kitchen and link to address
    const kitchen = await prisma.kitchen.create({
      data: {
        sellerId: user.id,
        addressId: address.id, // Link to address record
        name: validatedData.kitchenName,
        location: validatedData.address, // Keep temporarily for migration compatibility
        area: validatedData.zone, // Keep temporarily for migration compatibility
        latitude: validatedData.latitude, // Keep temporarily for migration compatibility
        longitude: validatedData.longitude, // Keep temporarily for migration compatibility
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

    // Update user's phone number (only if changed and not taken)
    if (validatedData.phone && validatedData.phone !== existingUser.phone) {
      // Check if phone number is already taken by another user
      const phoneExists = await prisma.user.findFirst({
        where: {
          phone: validatedData.phone,
          id: { not: user.id },
        },
      });

      if (phoneExists) {
        return NextResponse.json(
          { error: "Phone number is already registered" },
          { status: 400 }
        );
      }

      // Update phone number
      await prisma.user.update({
        where: { id: user.id },
        data: { phone: validatedData.phone },
      });
    }

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
