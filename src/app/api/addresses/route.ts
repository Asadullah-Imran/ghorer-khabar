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

    // Check if this user exists in database, if not check by email (OAuth vs email/password issue)
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      // User doesn't exist with this OAuth ID, check by email
      const supabase = await createClient();
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (supabaseUser?.email) {
        const userByEmail = await prisma.user.findUnique({
          where: { email: supabaseUser.email },
        });

        if (userByEmail) {
          userId = userByEmail.id;
          console.log(
            "GET /api/addresses - Found user by email, using database userId:",
            userId
          );
        }
      }
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
      const supabase = await createClient();
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (supabaseUser) {
        // Check if user with this email already exists
        const userByEmail = await prisma.user.findUnique({
          where: { email: supabaseUser.email! },
        });

        if (userByEmail) {
          // Use the existing user's ID instead
          userId = userByEmail.id;
          existingUser = userByEmail;
        } else {
          // Create new user
          try {
            existingUser = await prisma.user.create({
              data: {
                id: userId,
                email: supabaseUser.email!,
                name:
                  supabaseUser.user_metadata?.name ||
                  supabaseUser.email?.split("@")[0] ||
                  null,
                authProvider: "GOOGLE",
                emailVerified: true,
                avatar: supabaseUser.user_metadata?.avatar_url || null,
              },
            });
          } catch (userError: any) {
            console.log("User creation failed:", userError.message);
            return NextResponse.json(
              { error: "User account setup failed. Please contact support." },
              { status: 500 }
            );
          }
        }
      }
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
