import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Helper function to mask NID number
 * Shows only last 4 digits
 */
function maskNID(nid: string | null): string {
  if (!nid) return "";
  const lastFour = nid.slice(-4);
  return `****-****-${lastFour}`;
}

/**
 * Helper function to authenticate user
 */
async function authenticateUser(): Promise<string | null> {
  let userId: string | undefined;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (user && !authError) {
    userId = user.id;
  } else {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && typeof decoded === "object" && "userId" in decoded) {
        userId = decoded.userId as string;
      }
    }
  }

  return userId || null;
}

/**
 * GET /api/chef/settings
 * Fetch chef's kitchen settings including:
 * - Kitchen name, address
 * - Owner full name, phone number
 * - Operating days
 * - Masked NID number
 */
export async function GET() {
  try {
    const userId = await authenticateUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a seller
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
      },
    });

    if (!user || user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Only sellers can access chef settings" },
        { status: 403 }
      );
    }

    // Get kitchen details
    const kitchen = await prisma.kitchen.findFirst({
      where: { sellerId: userId },
      select: {
        id: true,
        name: true,
        location: true,
        area: true,
        operatingDays: true,
        nidName: true,
        isVerified: true,
      },
    });

    if (!kitchen) {
      return NextResponse.json(
        { error: "Kitchen not found. Please complete onboarding first." },
        { status: 404 }
      );
    }

    // Construct full address from location and area
    const fullAddress = kitchen.area 
      ? `${kitchen.location}, ${kitchen.area}`
      : kitchen.location;

    // Mask NID - show only last 4 characters
    const maskedNID = maskNID(kitchen.nidName);

    return NextResponse.json({
      success: true,
      data: {
        kitchenId: kitchen.id,
        kitchenName: kitchen.name,
        address: fullAddress,
        ownerName: user.name || "",
        phoneNumber: user.phone || "",
        operatingDays: kitchen.operatingDays || {},
        nidNumber: maskedNID,
        isVerified: kitchen.isVerified,
      },
    });
  } catch (error) {
    console.error("Error fetching chef settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/chef/settings
 * Update chef's kitchen settings
 * - Kitchen name (required, non-null)
 * - Address (required, non-null)
 * - Operating days
 */
export async function PUT(req: NextRequest) {
  try {
    const userId = await authenticateUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a seller
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user || user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Only sellers can update chef settings" },
        { status: 403 }
      );
    }

    // Get kitchen
    const kitchen = await prisma.kitchen.findFirst({
      where: { sellerId: userId },
      select: { id: true },
    });

    if (!kitchen) {
      return NextResponse.json(
        { error: "Kitchen not found. Please complete onboarding first." },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { kitchenName, address, operatingDays } = body;

    // Validation: Kitchen name and address are required
    if (!kitchenName || kitchenName.trim() === "") {
      return NextResponse.json(
        { error: "Kitchen name is required and cannot be empty" },
        { status: 400 }
      );
    }

    if (!address || address.trim() === "") {
      return NextResponse.json(
        { error: "Address is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Parse address to extract location and area
    // Assuming format: "location, area" or just "location"
    const addressParts = address.split(",").map((part: string) => part.trim());
    const location = addressParts[0] || address;
    const area = addressParts.length > 1 ? addressParts.slice(1).join(", ") : null;

    // Prepare update data
    const updateData: {
      name: string;
      location: string;
      area: string | null;
      updatedAt: Date;
      operatingDays?: object;
    } = {
      name: kitchenName.trim(),
      location: location,
      area: area,
      updatedAt: new Date(),
    };

    // If operating days provided, validate and update
    if (operatingDays !== undefined) {
      // Validate operating days structure
      if (typeof operatingDays !== "object" || Array.isArray(operatingDays)) {
        return NextResponse.json(
          { error: "Operating days must be an object" },
          { status: 400 }
        );
      }

      updateData.operatingDays = operatingDays;
    }

    // Update kitchen
    const updatedKitchen = await prisma.kitchen.update({
      where: { id: kitchen.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        location: true,
        area: true,
        operatingDays: true,
      },
    });

    // Construct full address
    const fullAddress = updatedKitchen.area 
      ? `${updatedKitchen.location}, ${updatedKitchen.area}`
      : updatedKitchen.location;

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      data: {
        kitchenId: updatedKitchen.id,
        kitchenName: updatedKitchen.name,
        address: fullAddress,
        operatingDays: updatedKitchen.operatingDays,
      },
    });
  } catch (error) {
    console.error("Error updating chef settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
