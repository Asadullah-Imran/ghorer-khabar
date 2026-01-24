import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    console.log("GET /api/auth/me - Cookie present:", !!token);
    if (token) {
      console.log("Token starts with:", token.substring(0, 20) + "...");
    }

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify JWT token
    const decoded = verifyToken(token);

    if (!decoded || typeof decoded === "string" || !decoded.userId) {
      // Clear the invalid cookie so the middleware doesn't get confused
      console.log("Token invalid or expired - clearing cookie");
      cookieStore.delete("auth_token");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId as string },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true, // Include avatar
        role: true,
        emailVerified: true,
        kitchens: {
          select: {
            id: true,
            onboardingCompleted: true,
            isVerified: true,
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format user object to match expected structure
    const userWithKitchen = {
      ...user,
      kitchen: user.kitchens[0]
        ? {
            id: user.kitchens[0].id,
            onboardingCompleted: user.kitchens[0].onboardingCompleted,
            isVerified: user.kitchens[0].isVerified,
          }
        : undefined,
    };

    // Add cache control headers to prevent stale data
    return NextResponse.json(
      { user: userWithKitchen },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
