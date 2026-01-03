import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { loginUser } from "@/services/auth.service";
import { setAuthCookie } from "@/lib/auth/session";
import { get } from "http";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Login attempt with body:", body);
    
    // Validate input with Zod
    const data = loginSchema.parse(body);
    

    // Call login service
    const { user, token } = await loginUser(data);

    // FIX: Must await this in Next.js 15/16
    await setAuthCookie(token);
    console.log("User logged in:", user);
    
    return NextResponse.json({
      message: "Login successful",
      user,
    }, { status: 200 });

  } catch (error: any) {
    // If Zod or the Service throws an error, return 401
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 401 }
    );
  }
}