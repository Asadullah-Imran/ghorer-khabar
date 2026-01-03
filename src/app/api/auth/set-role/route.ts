import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { roleName } = await req.json(); // "BUYER" or "SELLER"
    
    // 1. Get current user from Supabase
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name) { return cookieStore.get(name)?.value } } }
    );
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Find the Role ID from your Role table
    const roleRecord = await prisma.role.findUnique({
      where: { name: roleName }
    });

    if (!roleRecord) return NextResponse.json({ error: "Role not initialized in DB" }, { status: 404 });

    // 3. Create the UserRole link
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: roleRecord.id
        }
      },
      update: {}, // If already exists, do nothing
      create: {
        userId: user.id,
        roleId: roleRecord.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}