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
      // Merge Prisma data into the Supabase user object
      // This ensures the frontend gets fresh data even if Supabase metadata is stale
      const mergedUser = {
        ...supabaseUser,
        role: dbUser.role, // Top level role
        email: dbUser.email, // Ensure email matches DB
        user_metadata: {
          ...supabaseUser.user_metadata,
          name: dbUser.name,
          full_name: dbUser.name,
          avatar_url: dbUser.avatar,
          picture: dbUser.avatar,
          role: dbUser.role,
          kitchen: dbUser.kitchens[0]
            ? {
                id: dbUser.kitchens[0].id,
                onboardingCompleted: dbUser.kitchens[0].onboardingCompleted,
                isVerified: dbUser.kitchens[0].isVerified,
              }
            : undefined,
        },
      };
      
      return NextResponse.json({ user: mergedUser }, { status: 200 });
    }

    // Fallback to Supabase user if no DB record found (should rarely happen)
    return NextResponse.json({ user: supabaseUser }, { status: 200 });
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
