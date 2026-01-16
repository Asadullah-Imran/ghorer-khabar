import { syncUserFromSupabase } from "@/lib/auth/syncUser";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper to get user ID from token (supports both OAuth and email/password)
async function getUserIdFromToken(req: NextRequest): Promise<string | null> {
  // First, try Supabase OAuth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return user.id;
  }

  // Fallback to JWT token for email/password users
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// GET /api/addresses - List all addresses for authenticated user
export async function GET(req: NextRequest) {
  try {
    let userId = await getUserIdFromToken(req);
    console.log("GET /api/addresses - OAuth/JWT userId:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if this user exists in database
    let existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      // Try to sync from Supabase (handles ID mismatch)
      existingUser = await syncUserFromSupabase(userId);
      
      if (existingUser) {
        console.log("GET /api/addresses - Synced user from Supabase");
      }
    }

    if (!existingUser && userId) {
      // If still not found but we have a userId, it might be a valid JWT user who was deleted?
      // Or pure Supabase user creation failed.
      // For legacy consistency, if we truly can't find them, we let flow continue or 401.
      // The original code was returning empty addresses if no user found effectively? 
      // Actually original code proceeded to findMany with userId. If user doesn't exist, findMany returns empty [] usually strictly speaking FK might not enforce it on find?
      // But Prisma Address has relation to User. findMany might implicitly require user existence if we include it, but here we don't.
      // However, if we updated the ID, we want to make sure we use the ID that is IN THE DB.
      // syncUserFromSupabase updates the DB to use the 'userId' (Supabase ID).
      // So 'userId' variable is correct.
    }


    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: "desc" }, // Default address first
        { createdAt: "desc" }, // Then by creation date
      ],
    });

    console.log("GET /api/addresses - Found addresses:", addresses.length);
    console.log(
      "GET /api/addresses - Addresses:",
      JSON.stringify(addresses, null, 2)
    );

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

// POST /api/addresses - Create new address
export async function POST(req: NextRequest) {
  try {
    let userId = await getUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in database (important for OAuth users)
    let existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
       // Try to sync from Supabase (handles ID mismatch)
       existingUser = await syncUserFromSupabase(userId);
       
       if (existingUser) {
         console.log("POST /api/addresses - Synced user from Supabase");
         // Since syncUserFromSupabase updates userId in DB to match Supabase ID,
         // the original userId variable (Supabase ID) is now valid and correct.
       } else {
          // Fallback if sync failed but we have an ID (likely JWT case or error)
          // If it was JWT, existingUser should have been found.
          // This block is mostly reachable if it's Supabase auth but sync failed or disconnected.
       }
    }

    if (!existingUser) {
        // If still no user, we can't create address safely due to foreign key
        // However, the original code proceeded?
        // Original code tried to create a user if not found.
        // syncUserFromSupabase DOES create a user if not found!
        // So existingUser should be populated if sync succeeded.
        // If existingUser is null here, something is wrong with auth or DB.
        // We might want to return error.
         return NextResponse.json(
            { error: "User account verification failed. Please try logging in again." },
            { status: 401 }
         );
    }

    const body = await req.json();
    const { label, address, zone, latitude, longitude, isDefault } = body;

    // Validation
    if (!label || !address) {
      return NextResponse.json(
        { error: "Label and address are required" },
        { status: 400 }
      );
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        label,
        address,
        zone: zone || null,
        latitude: latitude || null,
        longitude: longitude || null,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({ address: newAddress }, { status: 201 });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}
