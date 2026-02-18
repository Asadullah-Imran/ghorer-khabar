import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/chef/menu/tags
 * Get all unique tags from all menu items for suggestions
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all menu items with tags
    const menuItems = await prisma.menu_items.findMany({
      where: {
        tags: {
          isEmpty: false, // Only get items that have tags
        },
      },
      select: {
        tags: true,
      },
    });

    // Extract and flatten all tags
    const allTags = menuItems.flatMap(item => item.tags);
    
    // Get unique tags and sort alphabetically
    const uniqueTags = [...new Set(allTags)].sort();

    return NextResponse.json({
      success: true,
      tags: uniqueTags,
      count: uniqueTags.length,
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
