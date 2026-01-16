import FavoriteTabs from "@/components/profile/favorites/FavoriteTabs";
import DishCard from "@/components/shared/DishCard";
import KitchenCard from "@/components/shared/KitchenCard";
import PlanCard from "@/components/shared/PlanCard";
import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function FavoritesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab = (params.tab as string) || "dishes";

  const userId = await getAuthUserId();

  // Fetch favorites from database
  let dishes: any[] = [];
  let kitchens: any[] = [];
  let plans: any[] = [];

  if (userId) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        dish: {
          include: {
            menu_item_images: true,
            users: {
              include: {
                kitchens: true,
              },
            },
          },
        },
        kitchen: true,
        plan: {
          include: {
            kitchen: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform favorites into the expected format
    favorites.forEach((fav) => {
      if (fav.dish) {
        dishes.push({
          id: fav.dish.id,
          name: fav.dish.name,
          price: fav.dish.price,
          rating: fav.dish.rating || 0,
          image: fav.dish.menu_item_images[0]?.imageUrl || "/placeholder-dish.jpg",
          kitchen: fav.dish.users.kitchens[0]?.name || "Unknown Kitchen",
          kitchenId: fav.dish.users.kitchens[0]?.id || "unknown",
          kitchenName: fav.dish.users.kitchens[0]?.name || "Unknown Kitchen",
          kitchenLocation: fav.dish.users.kitchens[0]?.location || undefined,
          kitchenRating: Number(fav.dish.users.kitchens[0]?.rating) || 0,
          kitchenReviewCount: fav.dish.users.kitchens[0]?.reviewCount || 0,
          deliveryTime: "30-45 min",
        });
      } else if (fav.kitchen) {
        kitchens.push({
          id: fav.kitchen.id,
          name: fav.kitchen.name,
          rating: Number(fav.kitchen.rating) || 0,
          reviews: fav.kitchen.reviewCount,
          image: fav.kitchen.coverImage || "/placeholder-kitchen.jpg",
          specialty: fav.kitchen.type || "Home Kitchen",
        });
      } else if (fav.plan) {
        plans.push({
          id: fav.plan.id,
          name: fav.plan.name,
          description: fav.plan.description,
          price: fav.plan.price,
          mealsPerDay: fav.plan.meals_per_day,
          servingsPerMeal: fav.plan.servings_per_meal,
          mealsPerMonth: fav.plan.meals_per_day * 30,
          rating: Number(fav.plan.rating) || 0,
          image: fav.plan.cover_image || "/placeholder-plan.jpg",
          kitchen: fav.plan.kitchen?.name || "Unknown Kitchen",
          type: fav.plan.meals_per_day >= 3 ? "Full Day" : fav.plan.meals_per_day >= 2 ? "Daily Plan" : "Single Meal",
        });
      }
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-700 transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to Profile
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-red-50 p-3 rounded-xl">
            <Heart className="text-red-500" size={28} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Your Favorites
            </h1>
            <p className="text-sm text-gray-500">Saved items you love</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <FavoriteTabs />

      {/* Content Grid Logic */}
      <div className="min-h-[300px]">
        {/* --- DISHES TAB --- */}
        {tab === "dishes" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dishes.length > 0 ? (
              dishes.map((dish: any) => (
                <DishCard key={dish.id} data={dish} isFavorite={true} />
              ))
            ) : (
              <EmptyState type="Dish" />
            )}
          </div>
        )}

        {/* --- KITCHENS TAB --- */}
        {tab === "kitchens" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kitchens.length > 0 ? (
              kitchens.map((kitchen: any) => (
                <KitchenCard key={kitchen.id} data={kitchen} isFavorite={true} />
              ))
            ) : (
              <EmptyState type="Kitchen" />
            )}
          </div>
        )}

        {/* --- SUBSCRIPTIONS TAB --- */}
        {tab === "subscriptions" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.length > 0 ? (
              plans.map((plan: any) => (
                <PlanCard key={plan.id} data={plan} isFavorite={true} />
              ))
            ) : (
              <EmptyState type="Subscription" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Internal Empty State
function EmptyState({ type }: { type: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
      <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
        <Heart size={32} className="text-gray-300" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">
        No Favorite {type}s Yet
      </h3>
      <p className="text-gray-500 text-sm mt-1 mb-4">
        Start exploring to save your best picks here.
      </p>
      <Link
        href="/explore"
        className="text-teal-700 font-bold text-sm hover:underline"
      >
        Browse {type}s
      </Link>
    </div>
  );
}
