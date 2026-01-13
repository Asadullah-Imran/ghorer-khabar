/**
 * Chef Authentication & Authorization Utilities
 * 
 * STATUS: Commented for future integration when main auth is ready
 * 
 * Provides:
 * - User extraction from OAuth/JWT
 * - Kitchen ownership verification
 * - Role-based access control
 */

import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
// import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Extract user ID from request
 * Tries: 1) Supabase OAuth  2) JWT cookie
 * 
 * TODO: Uncomment Supabase when auth ready
 */
export async function getUserIdFromRequest(
  _req: NextRequest
): Promise<string | null> {
  // TODO: Supabase OAuth
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (user) return user.id;

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

/**
 * Resolve user from DB (handles OAuth ID → email mismatch)
 * 
 * TODO: Email fallback when Supabase ready
 */
export async function getOrResolveUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user) return user;

  // TODO: Email fallback for OAuth
  // const supabase = await createClient();
  // const { data: { user: oauthUser } } = await supabase.auth.getUser();
  // if (oauthUser?.email) {
  //   user = await prisma.user.findUnique({
  //     where: { email: oauthUser.email },
  //   });
  // }

  return user;
}

/**
 * Get kitchen for SELLER user
 * 
 * TODO: Uncomment role check when auth ready
 */
export async function getChefKitchen(
  userId: string,
  kitchenId?: string
) {
  const user = await getOrResolveUser(userId);
  if (!user) return null;

  // TODO: Enforce SELLER role
  // if (user.role !== "SELLER") return null;

  const kitchen = await prisma.kitchen.findFirst({
    where: {
      sellerId: userId,
      ...(kitchenId && { id: kitchenId }),
    },
  });

  return kitchen;
}

export const authErrors = {
  UNAUTHORIZED: { message: "Not authenticated", status: 401 },
  FORBIDDEN: { message: "Not authorized", status: 403 },
  NOT_SELLER: { message: "Only sellers can access this", status: 403 },
  KITCHEN_NOT_FOUND: { message: "Kitchen not found", status: 404 },
};
