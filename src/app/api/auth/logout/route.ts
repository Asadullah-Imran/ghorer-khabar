import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient();

    // Clear JWT cookie (for email/password users)
    cookieStore.delete("auth_token");

    // Sign out from Supabase (for OAuth users)
    // This will clear all Supabase auth cookies
    await supabase.auth.signOut();

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
