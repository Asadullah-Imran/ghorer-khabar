import { NextRequest, NextResponse } from "next/server";
import { verifyEmail } from "@/services/authService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=invalid_token`
      );
    }

    const result = await verifyEmail(token);

    // Redirect to login with success message
    return NextResponse.redirect(
      `${
        process.env.NEXT_PUBLIC_APP_URL
      }/login?verified=true&email=${encodeURIComponent(result.email)}`
    );
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=${encodeURIComponent(
        error.message || "verification_failed"
      )}`
    );
  }
}
