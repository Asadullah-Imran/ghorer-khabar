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

function normalizeBdPhone(phone: string): string {
  // keep digits only
  let digits = phone.replace(/\D/g, "");

  // Remove country code if present
  if (digits.startsWith("880")) digits = digits.slice(3);

  // If user entered 10 digits starting with 1 (e.g. 1712345678), prepend 0
  if (digits.length === 10 && digits.startsWith("1")) digits = `0${digits}`;

  // Ensure final format is 11 digits starting with 01
  if (!/^01\d{9}$/.test(digits)) {
    throw new Error("Phone number must be 11 digits starting with 01");
  }

  return digits;
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

    // Prisma Json type returns parsed objects, but can also be null
    // Handle both cases: null/undefined or already-parsed object
    console.log("=== GET /api/chef/settings ===");
    console.log("Raw operatingDays from DB:", kitchen.operatingDays);
    console.log("Type of operatingDays:", typeof kitchen.operatingDays);
    console.log("Is null?", kitchen.operatingDays === null);
    console.log("Is undefined?", kitchen.operatingDays === undefined);
    
    let operatingDaysData: Record<string, any> | null = null;
    if (kitchen.operatingDays !== null && kitchen.operatingDays !== undefined) {
      // Prisma Json fields are usually already parsed, but handle string case just in case
      if (typeof kitchen.operatingDays === 'string') {
        try {
          const parsed = JSON.parse(kitchen.operatingDays);
          // Only set if parsed object has keys
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            operatingDaysData = parsed;
          }
        } catch {
          operatingDaysData = null;
        }
      } else if (typeof kitchen.operatingDays === 'object') {
        // Check if it's an empty object or has actual data
        const keys = Object.keys(kitchen.operatingDays);
        if (keys.length > 0) {
          operatingDaysData = kitchen.operatingDays as Record<string, any>;
        }
      }
    }
    
    console.log("Final operatingDaysData:", operatingDaysData);
    console.log("Final operatingDaysData keys:", operatingDaysData ? Object.keys(operatingDaysData) : 'null');
    console.log("==============================\n");

    return NextResponse.json({
      success: true,
      data: {
        kitchenId: kitchen.id,
        kitchenName: kitchen.name,
        address: fullAddress,
        ownerName: user.name || "",
        phoneNumber: user.phone || "",
        operatingDays: operatingDaysData || {},
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
    const { kitchenName, address, operatingDays, ownerName, phoneNumber } = body;

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
    console.log("=== PUT /api/chef/settings ===");
    console.log("Received operatingDays:", operatingDays);
    console.log("operatingDays type:", typeof operatingDays);
    console.log("operatingDays is undefined?", operatingDays === undefined);
    console.log("operatingDays is null?", operatingDays === null);
    
    if (operatingDays !== undefined && operatingDays !== null) {
      // Validate operating days structure
      if (typeof operatingDays !== "object" || Array.isArray(operatingDays)) {
        return NextResponse.json(
          { error: "Operating days must be an object" },
          { status: 400 }
        );
      }

      // Check if it's an empty object
      const keys = Object.keys(operatingDays);
      console.log("operatingDays keys:", keys);
      console.log("operatingDays keys length:", keys.length);
      
      if (keys.length === 0) {
        console.log("WARNING: operatingDays is an empty object, not saving");
      } else {
        // Prisma Json type accepts plain JavaScript objects directly
        // No need for JSON.parse/stringify - Prisma handles serialization
        console.log("Saving operatingDays to DB:", JSON.stringify(operatingDays, null, 2));
        updateData.operatingDays = operatingDays as any;
      }
    } else {
      console.log("operatingDays not provided in request body");
    }

    // Prepare user update data if ownerName or phoneNumber provided
    const userUpdateData: { name?: string; phone?: string } = {};
    if (ownerName !== undefined && ownerName.trim() !== "") {
      userUpdateData.name = ownerName.trim();
    }
    if (phoneNumber !== undefined && phoneNumber.trim() !== "") {
      try {
        userUpdateData.phone = normalizeBdPhone(phoneNumber.trim());
      } catch (e) {
        return NextResponse.json(
          { error: e instanceof Error ? e.message : "Invalid phone number" },
          { status: 400 }
        );
      }
    }

    // Update user if name or phone changed
    if (Object.keys(userUpdateData).length > 0) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: userUpdateData,
        });
      } catch (err) {
        // Handle unique constraint on phone (Prisma error code P2002)
        const anyErr = err as any;
        if (anyErr?.code === "P2002") {
          const target = Array.isArray(anyErr?.meta?.target) ? anyErr.meta.target : [];
          if (target.includes("phone")) {
            return NextResponse.json(
              { error: "This phone number is already used by another account." },
              { status: 409 }
            );
          }
        }
        throw err;
      }
    }

    // Update kitchen
    console.log("Updating kitchen with data:", JSON.stringify(updateData, null, 2));
    console.log("updateData.operatingDays:", updateData.operatingDays);
    console.log("updateData.operatingDays type:", typeof updateData.operatingDays);
    
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

    console.log("Updated kitchen operatingDays from DB:", updatedKitchen.operatingDays);
    console.log("Type of updated operatingDays:", typeof updatedKitchen.operatingDays);
    console.log("Is null?", updatedKitchen.operatingDays === null);
    console.log("Keys:", updatedKitchen.operatingDays && typeof updatedKitchen.operatingDays === 'object' ? Object.keys(updatedKitchen.operatingDays) : 'N/A');

    // Construct full address
    const fullAddress = updatedKitchen.area 
      ? `${updatedKitchen.location}, ${updatedKitchen.area}`
      : updatedKitchen.location;

    // Prisma Json fields are usually already parsed objects
    let responseOperatingDays: Record<string, any> = {};
    if (updatedKitchen.operatingDays) {
      if (typeof updatedKitchen.operatingDays === 'string') {
        try {
          responseOperatingDays = JSON.parse(updatedKitchen.operatingDays);
        } catch {
          responseOperatingDays = {};
        }
      } else {
        responseOperatingDays = updatedKitchen.operatingDays as Record<string, any>;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      data: {
        kitchenId: updatedKitchen.id,
        kitchenName: updatedKitchen.name,
        address: fullAddress,
        operatingDays: responseOperatingDays,
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
