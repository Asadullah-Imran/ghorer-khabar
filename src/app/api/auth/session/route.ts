import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Fetch fresh profile data from Prisma
    // This is the Source of Truth for name, avatar, role, etc.
    const dbUser = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
      select: {
        name: true,
        avatar: true,
        role: true,
        email: true,
        kitchens: {
          select: {
            id: true,
            onboardingCompleted: true,
            isVerified: true,
          },
          take: 1, // Currently assuming one kitchen per user
        },
      },
    });

    if (dbUser) {
      const primaryKitchen = dbUser.kitchens[0];

      // Merge Prisma data into the Supabase user object
      // This ensures the frontend gets fresh data even if Supabase metadata is stale
      const mergedUser = {
        ...supabaseUser,
        role: dbUser.role, // Top level role
        email: dbUser.email, // Ensure email matches DB
        // Expose kitchen on top-level for client guards (e.g., ChefGuard)
        kitchen: primaryKitchen
          ? {
              id: primaryKitchen.id,
              onboardingCompleted: primaryKitchen.onboardingCompleted,
              isVerified: primaryKitchen.isVerified,
            }
          : undefined,
        user_metadata: {
          ...supabaseUser.user_metadata,
          name: dbUser.name,
          full_name: dbUser.name,
          // Always use database avatar as source of truth
          avatar_url: dbUser.avatar || null,
          picture: dbUser.avatar || null,
          role: dbUser.role,
          kitchen: primaryKitchen
            ? {
                id: primaryKitchen.id,
                onboardingCompleted: primaryKitchen.onboardingCompleted,
                isVerified: primaryKitchen.isVerified,
              }
            : undefined,
        },
      };

      // console.log("/api/auth/session -> merged user", {
      //   id: mergedUser.id,
      //   email: mergedUser.email,
      //   role: mergedUser.role,
      //   kitchen: mergedUser.kitchen,
      // });

      // Add cache control headers to prevent stale data
      return NextResponse.json(
        { user: mergedUser },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
          },
        }
      );
    }

    // Fallback to Supabase user if no DB record found (should rarely happen)
    return NextResponse.json({ user: supabaseUser }, { status: 200 });
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
