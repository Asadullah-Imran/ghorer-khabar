import { handleOAuthUser } from "@/services/authService";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/feed";
  const roleParam = searchParams.get("role"); // Get role from URL query

  try {
    if (code) {
      const cookieStore = await cookies();
      const supabase = createServerClient(
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
                console.error("Error setting cookies:", error);
              }
            },
          },
        }
      );

      // 1. Exchange the temporary code for a Supabase session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      console.log("Supabase session exchange result:", {
        success: !!data?.session,
        error: error?.message,
        userId: data?.user?.id,
      });

      if (!error && data?.user) {
        console.log("User authenticated via Google:", data.user.email);

        // Determine role priority: URL param > user_metadata > default to BUYER
        let role: "BUYER" | "SELLER" | "ADMIN" = "BUYER";

        if (
          roleParam &&
          ["buyer", "seller", "admin"].includes(roleParam.toLowerCase())
        ) {
          role = roleParam.toUpperCase() as "BUYER" | "SELLER" | "ADMIN";
          console.log("Using role from URL param:", role);
        } else if (data.user.user_metadata.role) {
          role = data.user.user_metadata.role as "BUYER" | "SELLER" | "ADMIN";
          console.log("Using role from user_metadata:", role);
        }

        // Create or update user in database using the authService
        await handleOAuthUser(
          data.user.email!,
          data.user.user_metadata.full_name,
          data.user.id, // Google's providerId
          data.user.user_metadata.avatar_url,
          role
        );

        console.log(
          "Database Sync Successful for:",
          data.user.email,
          "with role:",
          role
        );

        // Redirect based on role
        let redirectUrl = next;
        if (role === "SELLER") {
          redirectUrl = "/chef/dashboard";
        }
        
        // Redirect with success
        return NextResponse.redirect(`${origin}${redirectUrl}`);
      } else {
        console.error("Session exchange failed:", error);
        return NextResponse.redirect(`${origin}/login?error=auth_failed`);
      }
    }

    // Fallback if no code
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  } catch (error) {
    console.error("Auth Callback Error:", error);
    return NextResponse.redirect(`${origin}/login?error=server_error`);
  }
}
