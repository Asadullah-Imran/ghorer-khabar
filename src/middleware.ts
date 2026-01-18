import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({
              name,
              value,
              ...options,
            })
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set({
              name,
              value,
              ...options,
              maxAge: 60 * 60 * 24 * 30, // 30 days
              sameSite: "lax" as const,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
            })
          );
        },
      },
    }
  );

  // Refresh session if expired - this will keep the user logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    console.log("Middleware: User session found for", user.email);
  }

  // Check for custom JWT cookie
  const authToken = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Protect Admin Routes - require authentication and ADMIN role
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin-login")) {
    // If no auth token, redirect to admin login
    if (!authToken && !user) {
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }

    // Verify admin role - fetch user data from API
    try {
      const apiUrl = new URL("/api/auth/me", request.url);
      const meResponse = await fetch(apiUrl.toString(), {
        headers: {
          Cookie: `auth_token=${authToken}`,
        },
      });

      if (meResponse.ok) {
        const { user: dbUser } = await meResponse.json();
        if (dbUser.role !== "ADMIN") {
          // Not an admin, redirect to home
          return NextResponse.redirect(new URL("/", request.url));
        }
      } else if (!user) {
        // No valid JWT and no Supabase user
        return NextResponse.redirect(new URL("/admin-login", request.url));
      }
    } catch (error) {
      console.error("Error verifying admin:", error);
      if (!user) {
        return NextResponse.redirect(new URL("/admin-login", request.url));
      }
    }
  }

  // Protect Auth Routes (Login/Register)
  // If user is already logged in (Supabase OR JWT), redirect to /feed
  if (
    user || // Supabase User
    authToken // Email/Password User
  ) {
    if (pathname === "/login" || pathname === "/register") {
      const redirectUrl = request.nextUrl.searchParams.get("redirect") || "/auth/redirect";
      const url = request.nextUrl.clone();
      url.pathname = redirectUrl;
      url.search = ""; // Clear query params for clean redirect logic
      
      // If redirect url is relative (e.g. /feed), ensure it's handled correctly
      // But typically clone() keeps origin.
      // Reset logic:
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // If admin is already logged in and tries to access admin-login, redirect to dashboard
    if (pathname === "/admin-login") {
      try {
        const apiUrl = new URL("/api/auth/me", request.url);
        const meResponse = await fetch(apiUrl.toString(), {
          headers: {
            Cookie: `auth_token=${authToken}`,
          },
        });

        if (meResponse.ok) {
          const { user: dbUser } = await meResponse.json();
          if (dbUser.role === "ADMIN") {
            return NextResponse.redirect(new URL("/admin/dashboard", request.url));
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
