import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hashPassword } from "@/lib/auth/hash";

export async function POST(req: Request) {
  try {
    // Added 'type' to the destructuring to handle registration vs recovery
    const { email, otp, name, password, type, role } = await req.json();
    const cookieStore = await cookies();
    console.log("Received OTP verification request for email:", email, "type:", type);
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name) { return cookieStore.get(name)?.value },
          set(name, value, options) { cookieStore.set({ name, value, ...options }) },
          remove(name, options) { cookieStore.delete({ name, ...options }) },
        },
      }
    );

    // 1. Verify OTP with dynamic type
    // Registration uses 'email' or 'signup', Forgot Password uses 'recovery'
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: type === 'recovery' ? 'recovery' : 'email', 
    });

    if (error || !data.user) {
      console.error("Supabase Auth Error:", error?.message);
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    // 2. Hash the new password provided by the user
    const hashedPassword = await hashPassword(password);

    // Normalize role; default BUYER
    const normalizedRole = (role || "BUYER").toString().toUpperCase() === "SELLER" ? "SELLER" : "BUYER";

    // 3. Sync with Prisma
    // If 'recovery', we just update the password. If 'signup', we create the user.
    const user = await prisma.user.upsert({
      where: { email },
      update: { 
        password: hashedPassword,
        ...(name && { name }), // Only update name if provided
        ...(type !== 'recovery' ? { role: normalizedRole } : {}),
      },
      create: {
        id: data.user.id,
        email,
        name: name || "New User",
        password: hashedPassword,
        role: normalizedRole,
      },
    });

    // Note: 'createServerClient' automatically set the session cookies 
    // in 'cookieStore' above upon successful 'verifyOtp'.

    return NextResponse.json({ 
      success: true, 
      message: type === 'recovery' ? "Password reset successful" : "Registration complete",
      user 
    });

  } catch (err: any) {
    console.error("Verification Route Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}