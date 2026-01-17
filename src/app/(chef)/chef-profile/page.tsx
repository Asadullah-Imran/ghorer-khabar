"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import ChefProfileView from "@/components/chef/Profile/ChefProfileView";

export default async function ChefProfilePage() {
  const supabase = await createClient();
  
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch kitchen data for this chef
  const kitchen = await prisma.kitchen.findFirst({
    where: { sellerId: user.id },
    include: {
      gallery: {
        orderBy: { order: "asc" },
      },
      seller: {
        select: {
          id: true,
          name: true,
          avatar: true,
          email: true,
        },
      },
    },
  });

  if (!kitchen) {
    redirect("/chef/onboarding");
  }

  // Fetch menu items for this kitchen
  const menuItems = await prisma.menu_items.findMany({
    where: {
      chef_id: kitchen.sellerId,
    },
    include: {
      menu_item_images: {
        orderBy: { order: "asc" },
        take: 1,
      },
    },
    orderBy: { category: "asc" },
  });

  // Transform data
  const transformedMenu = menuItems.map((item) => ({
    id: item.id,
    name: item.name,
    desc: item.description || "",
    description: item.description || "",
    price: item.price,
    category: item.category,
    image: item.menu_item_images[0]?.imageUrl || "/placeholder-dish.jpg",
    rating: item.rating || 0,
    isVegetarian: item.isVegetarian,
    spiciness: item.spiciness,
    prepTime: item.prepTime,
    time: item.prepTime ? `${item.prepTime} min` : "30 min",
  }));

  const data = {
    id: kitchen.id,
    name: kitchen.name,
    type: kitchen.type || "Home Kitchen",
    description: kitchen.description || "A wonderful kitchen serving delicious food",
    location: kitchen.location || "Dhaka",
    area: kitchen.area || "Unknown Area",
    distance: kitchen.distance || 0,
    image: kitchen.coverImage || "/placeholder-kitchen.jpg",
    profileImage: kitchen.profileImage || undefined,
    rating: Number(kitchen.rating) || 0,
    reviewCount: kitchen.reviewCount,
    kriScore: kitchen.kriScore,
    stats: {
      orders: kitchen.totalOrders.toString(),
      satisfaction: `${Number(kitchen.satisfactionRate) || 90}%`,
    },
    gallery: kitchen.gallery?.map((img) => img.imageUrl) || [],
    menu: transformedMenu || [],
    featuredItems: transformedMenu && transformedMenu.length > 0
      ? transformedMenu
          .filter((item) => item.rating >= 4)
          .slice(0, 5).length > 0
        ? transformedMenu.filter((item) => item.rating >= 4).slice(0, 5)
        : transformedMenu.slice(0, 5)
      : [],
    plans: [],
    seller: {
      id: kitchen.seller.id,
      name: kitchen.seller.name || undefined,
      email: kitchen.seller.email,
    },
  };

  return <ChefProfileView kitchen={data} />;
}
