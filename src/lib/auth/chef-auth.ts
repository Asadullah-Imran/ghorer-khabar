/**
 * Chef Authentication & Authorization Utilities
 *
 * Provides:
 * - User extraction from Supabase OAuth and JWT
 * - Kitchen ownership verification
 * - Role-based access control
 * - Both NextRequest (for middleware) and context-based auth
 */

import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";

// ============================================================================
// CONTEXT-BASED AUTH (for Server Components & Server Actions)
// ============================================================================

/**
 * Get authenticated user from current context
 * Tries: 1) Supabase OAuth  2) JWT cookie
 *
 * Use in Server Components and Server Actions
 */
export async function getAuthenticatedUser() {
  // Try Supabase first (for OAuth users)
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (supabaseUser) {
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

// ============================================================================
// REQUEST-BASED AUTH (for Middleware)
// ============================================================================

/**
 * Extract user ID from NextRequest
 * Tries: 1) Supabase OAuth  2) JWT cookie
 *
 * Use in middleware where you have access to NextRequest
 */
export async function getUserIdFromRequest(
  req: NextRequest
): Promise<string | null> {
  // Try Supabase OAuth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return user.id;

  // Try JWT cookie from request
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return null;

  try {
    const decoded = verifyToken(token);
    if (decoded && typeof decoded !== "string" && decoded.userId) {
      return decoded.userId as string;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get full user object from NextRequest
 * Use in middleware for complete user data
 */
export async function getUserFromRequest(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
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

// ============================================================================
// CHEF-SPECIFIC AUTHORIZATION
// ============================================================================

/**
 * Verify user is authenticated and has SELLER role
 * Throws AuthError if not authorized
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
 * Get chef's kitchen by user ID
 * Returns kitchen with gallery or null if not found
 */
export async function getChefKitchen(userId: string, kitchenId?: string) {
  const kitchen = await prisma.kitchen.findFirst({
    where: {
      sellerId: userId,
      ...(kitchenId && { id: kitchenId }),
    },
    include: {
      gallery: true,
    },
  });

  return kitchen;
}

/**
 * Verify chef has completed onboarding (has a kitchen)
 * Throws AuthError if kitchen not found
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
 * Verify user owns the specified kitchen
 * Throws AuthError if not found or not owned
 */
export async function verifyKitchenOwnership(
  userId: string,
  kitchenId: string
) {
  const kitchen = await getChefKitchen(userId, kitchenId);

  if (!kitchen) {
    throw new AuthError("Kitchen not found or access denied", 404);
  }

  return kitchen;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Custom error class for auth errors with status codes
 */
export class AuthError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Legacy error objects for backward compatibility
 * @deprecated Use AuthError class instead
 */
export const authErrors = {
  UNAUTHORIZED: { message: "Not authenticated", status: 401 },
  FORBIDDEN: { message: "Not authorized", status: 403 },
  NOT_SELLER: { message: "Only sellers can access this", status: 403 },
  KITCHEN_NOT_FOUND: { message: "Kitchen not found", status: 404 },
};
