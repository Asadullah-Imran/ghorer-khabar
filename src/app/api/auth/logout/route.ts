import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient();

    console.log("Logging out user...");

    // Clear JWT cookie (for email/password users) - more explicit deletion
    cookieStore.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    // Also try delete method
    cookieStore.delete("auth_token");

    console.log("JWT cookie cleared");

    // Sign out from Supabase (for OAuth users)
    // This will clear all Supabase auth cookies
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Supabase signOut error:", error);
    }

    // Manually clear all Supabase cookies
    const allCookies = cookieStore.getAll();
    console.log(
      "All cookies before cleanup:",
      allCookies.map((c) => c.name)
    );

    // Clear Supabase-specific cookies
    allCookies.forEach((cookie) => {
      if (
        cookie.name.includes("supabase") ||
        cookie.name.includes("sb-") ||
        cookie.name.includes("auth")
      ) {
        console.log("Deleting cookie:", cookie.name);
        cookieStore.delete(cookie.name);
        // Also set with maxAge 0 to ensure deletion
        cookieStore.set(cookie.name, "", {
          maxAge: 0,
          path: "/",
        });
      }
    });

    console.log("All auth cookies cleared");

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
