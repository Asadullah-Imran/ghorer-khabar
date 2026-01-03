import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma/prisma';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const roleParam = (searchParams.get('role') || 'BUYER').toUpperCase();
  const normalizedRole = roleParam === 'SELLER' ? 'SELLER' : 'BUYER';

  try {
    if (code) {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name) { return cookieStore.get(name)?.value },
            set(name, value, options) { cookieStore.set({ name, value, ...options }) },
            remove(name, options) { cookieStore.delete({ name, ...options }) },
          },
        }
      );

      // 1. Exchange the temporary code for a Supabase session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      //console.log("Supabase session exchange result:", { data, error });
  
      if (!error && data?.user) {
        console.log("User authenticated via Google:", data.user);

        // 2. Sync/Update the user data in Prisma, defaulting to BUYER
        const syncUser = await prisma.user.upsert({
          where: { email: data.user.email! },
          update: { 
            name: data.user.user_metadata.full_name,
            role: normalizedRole,
          },
          create: {
            id: data.user.id, // Supabase UUID String
            email: data.user.email!,
            name: data.user.user_metadata.full_name,
            password: "", // Empty for OAuth users
            role: normalizedRole,
          },
        });

        console.log("Database Sync Successful for:", syncUser.email);
        return NextResponse.redirect(`${origin}/feed`);
      }
    }

 

    // Fallback if no code or error in session exchange
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);

  } catch (error) {
    console.error("Auth Callback Error:", error);
    return NextResponse.redirect(`${origin}/login?error=server_error`);
  }
}