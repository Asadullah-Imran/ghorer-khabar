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

// PATCH /api/addresses/[id] - Update address or set as default
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let userId = await getUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user exists in database, if not check by email (OAuth vs email/password issue)
    let existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
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
        }
      }
    }

    const { id } = await params;
    const body = await req.json();
    const { label, address, zone, latitude, longitude, isDefault } = body;

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        ...(label !== undefined && { label }),
        ...(address !== undefined && { address }),
        ...(zone !== undefined && { zone }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return NextResponse.json({ address: updatedAddress });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

// DELETE /api/addresses/[id] - Delete address
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let userId = await getUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user exists in database, if not check by email (OAuth vs email/password issue)
    let existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
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
        }
      }
    }

    const { id } = await params;

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
