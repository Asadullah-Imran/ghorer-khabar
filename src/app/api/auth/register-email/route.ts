import { NextRequest, NextResponse } from "next/server";
import { registerWithEmail } from "@/services/authService";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const result = await registerWithEmail(
      email,
      password,
      name,
      role || "BUYER"
    );

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
