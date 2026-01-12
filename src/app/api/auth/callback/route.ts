import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { handleOAuthUser } from "@/services/authService";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  try {
    if (code) {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name) {
              return cookieStore.get(name)?.value;
            },
            set(name, value, options) {
              cookieStore.set({
                name,
                value,
                ...options,
                maxAge: 60 * 60 * 24 * 30, // 30 days
                sameSite: "lax",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
              });
            },
            remove(name, options) {
              cookieStore.delete({ name, ...options });
            },
          },
        }
      );

      // 1. Exchange the temporary code for a Supabase session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      //console.log("Supabase session exchange result:", { data, error });

      if (!error && data?.user) {
        console.log("User authenticated via Google:", data.user);

        // Get user role from metadata or default to BUYER
        const role =
          (data.user.user_metadata.role as "BUYER" | "SELLER" | "ADMIN") ||
          "BUYER";

        // Create or update user in database using the authService
        await handleOAuthUser(
          data.user.email!,
          data.user.user_metadata.full_name,
          data.user.id, // Google's providerId
          data.user.user_metadata.avatar_url,
          role
        );

        console.log("Database Sync Successful for:", data.user.email);
        return NextResponse.redirect(`${origin}/feed`);
      }
    }

    // Fallback if no code or error in session exchange
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  } catch (error) {
    console.error("Auth Callback Error:", error);
    return NextResponse.redirect(`${origin}/login?error=server_error`);
  }
}
