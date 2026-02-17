"use server";

import { prisma } from "@/lib/prisma/prisma";

export async function getCategoryMarketData(category: string) {
  try {
    // 1. Get aggregate data for this category
    const aggregations = await prisma.menu_items.aggregate({
      where: {
        category: category,
        isAvailable: true,
        price: { gt: 0 } // Exclude free items if any
      },
      _avg: {
        price: true
      },
      _min: {
        price: true
      },
      _max: {
        price: true
      },
      _count: true
    });

    return {
      success: true,
      avgPrice: aggregations._avg.price || 0,
      minPrice: aggregations._min.price || 0,
      maxPrice: aggregations._max.price || 0,
      count: aggregations._count
    };
  } catch (error) {
    console.error("Error fetching market data:", error);
    return { success: false, error: "Failed to fetch market data" };
  }
}
