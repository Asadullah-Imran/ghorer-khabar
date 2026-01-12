import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({
                name,
                value,
                ...options,
                maxAge: 60 * 60 * 24 * 30, // 30 days
                sameSite: "lax" as const,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
              });
            });
          } catch (error) {
            // Handle cookie setting errors in middleware
          }
        },
      },
    }
  );
}
