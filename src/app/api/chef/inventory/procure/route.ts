import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function getAuthenticatedChefId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  let userId = user?.id;

  if (!userId && error) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && typeof decoded === "object" && "userId" in decoded) {
        userId = (decoded as any).userId as string;
      }
    }
  }

  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser || dbUser.role !== "SELLER") {
    return {
      error: NextResponse.json(
        { error: "Only sellers can access inventory" },
        { status: 403 },
      ),
    };
  }

  return { userId };
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedChefId();
    if (auth.error) return auth.error;

    const body = await req.json();
    const { items } = body || {};

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items array is required" },
        { status: 400 },
      );
    }

    // Process each item to update stock
    const updatePromises = items.map(async (item: { name: string; quantity: number }) => {
      // Find the item in inventory
      const existingItem = await prisma.inventory_items.findFirst({
        where: {
          chef_id: auth.userId,
          name: item.name
        }
      });

      if (existingItem) {
        return prisma.inventory_items.update({
          where: { id: existingItem.id },
          data: {
            currentStock: {
              increment: item.quantity
            }
          }
        });
      }
      return null;
    });

    const results = await Promise.all(updatePromises);
    const updatedCount = results.filter(r => r !== null).length;

    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed ${updatedCount} items into inventory`,
      updatedCount 
    });
  } catch (error) {
    console.error("Error processing procurement:", error);
    return NextResponse.json(
      { error: "Failed to process procurement" },
      { status: 500 },
    );
  }
}
