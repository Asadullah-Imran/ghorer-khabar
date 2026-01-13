import { verifyToken } from "@/lib/auth/jwt";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Gets the authenticated user ID from either Supabase or JWT cookie
 * Supports both OAuth (Supabase) and email/password (JWT) authentication
 */
export async function getAuthUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();

    // First try Supabase authentication (for OAuth users)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (supabaseUser) {
      return supabaseUser.id;
    }

    // If no Supabase user, try JWT token (for email/password users)
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);

    if (!decoded || typeof decoded === "string" || !decoded.userId) {
      return null;
    }

    return decoded.userId as string;
  } catch (error) {
    console.error("Error getting auth user:", error);
    return null;
  }
}
