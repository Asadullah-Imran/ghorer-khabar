import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { verifyToken } from "./jwt";

/**
 * Get authenticated user from either Supabase session or JWT token
 * Returns user object with role or null if not authenticated
 */
export async function getAuthenticatedUser() {
  // Try Supabase first (for OAuth users)
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (supabaseUser) {
    // Get full user data from database including role
    const user = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
      },
    });
    return user;
  }

  // Try JWT token (for email/password users)
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded && typeof decoded !== "string" && decoded.userId) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId as string },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
        },
      });
      return user;
    }
  }

  return null;
}

/**
 * Verify user is authenticated and has SELLER role
 * Throws error with appropriate status code if not authorized
 */
export async function requireChefAuth() {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new AuthError("Unauthorized", 401);
  }

  if (user.role !== "SELLER") {
    throw new AuthError("Only sellers can access this resource", 403);
  }

  return user;
}

/**
 * Get chef's kitchen
 * Returns kitchen if user is a seller and has completed onboarding
 */
export async function getChefKitchen(userId: string) {
  const kitchen = await prisma.kitchen.findFirst({
    where: { sellerId: userId },
    include: {
      gallery: true,
    },
  });

  return kitchen;
}

/**
 * Verify chef has completed onboarding (has a kitchen)
 */
export async function requireKitchen(userId: string) {
  const kitchen = await getChefKitchen(userId);

  if (!kitchen) {
    throw new AuthError(
      "Please complete chef onboarding before accessing this resource",
      403
    );
  }

  return kitchen;
}

/**
 * Custom error class for auth errors with status codes
 */
export class AuthError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "AuthError";
  }
}
