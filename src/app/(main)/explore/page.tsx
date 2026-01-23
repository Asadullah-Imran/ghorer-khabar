import FilterTabs from "@/components/explore/FilterTabs";
import DishCard from "@/components/shared/DishCard";
import KitchenCard from "@/components/shared/KitchenCard";
import PlanCard from "@/components/shared/PlanCard";
import { getAuthUserId } from "@/lib/auth/getAuthUser";
import {
    CATEGORIES
} from "@/lib/dummy-data/explore";
import { prisma } from "@/lib/prisma/prisma";


// Define the type for URL search params
interface SearchParamsProps {
  searchParams: { [key: string]: string | string[] | undefined };
}


// ... existing imports ...

export default async function ExplorePage({ searchParams }: SearchParamsProps) {
  const params = await searchParams;

  const tab = (params.tab as string) || "dishes";
  const category = (params.category as string) || "All";
  const sort = (params.sort as string) || "recommended";
  const query = (params.q as string) || "";
  const zone = (params.zone as string) || "";

  // --- SERVER SIDE FETCHING ---
  
  // 1. Dishes Fetching (Active only if tab is 'dishes')
  let dishes: any[] = [];
  if (tab === "dishes") {
    const where: any = {
      isAvailable: true,
      // Search logic
      OR: query ? [
        { name: { contains: query, mode: "insensitive" } },
        { users: { kitchens: { some: { name: { contains: query, mode: "insensitive" } } } } }
      ] : undefined,
      // Kitchen status filter
      users: {
        kitchens: {
          some: {
            isActive: true,
            isOpen: true,
            isVerified: true,
            // Zone filter logic
            ...(zone && {
              address: {
                zone: zone,
              },
            }),
          },
        },
      },
    };

    // Category logic
    if (category !== "All") {
      where.category = category;
    }

    // Sorting logic
    const orderBy: any = {};
    if (sort === "price_asc") orderBy.price = "asc";
    else if (sort === "price_desc") orderBy.price = "desc";
    else if (sort === "rating") orderBy.rating = "desc";
    else orderBy.createdAt = "desc"; // Default sort

    const dbDishes = await prisma.menu_items.findMany({
      where,
      orderBy,
      include: {
        menu_item_images: true,
        users: {
          include: {
            kitchens: true,
          }
        }
      }
    });

    dishes = dbDishes.map(d => ({
        id: d.id,
        name: d.name,
        price: d.price,
        rating: d.rating || 0,
        image: d.menu_item_images[0]?.imageUrl || "/placeholder-dish.jpg",
        kitchen: d.users.kitchens[0]?.name || "Unknown Kitchen",
        kitchenId: d.users.kitchens[0]?.id || "unknown",
        kitchenName: d.users.kitchens[0]?.name || "Unknown Kitchen",
        kitchenLocation: d.users.kitchens[0]?.location || undefined,
        kitchenRating: Number(d.users.kitchens[0]?.rating) || 0,
        kitchenReviewCount: d.users.kitchens[0]?.reviewCount || 0,
        deliveryTime: "30-45 min" // Placeholder as it's not in schema currently
    }));
  }

  // 2. Subscription Plans Fetching (Active only if tab is 'subscriptions')
  let plans: any[] = [];
  if (tab === "subscriptions") {
    const where: any = {
      is_active: true,
      // Kitchen status filter
      kitchen: {
        isActive: true,
        isOpen: true,
        isVerified: true,
      },
      // Search logic
      OR: query ? [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { kitchen: { name: { contains: query, mode: "insensitive" } } }
      ] : undefined,
    };

    // Sorting logic
    const orderBy: any = {};
    if (sort === "price_asc") orderBy.price = "asc";
    else if (sort === "price_desc") orderBy.price = "desc";
    else if (sort === "rating") orderBy.rating = "desc";
    else orderBy.subscriber_count = "desc"; // Default: most popular

    const dbPlans = await prisma.subscription_plans.findMany({
      where,
      orderBy,
      include: {
        kitchen: {
          select: {
            id: true,
            name: true,
            rating: true,
            location: true,
          }
        }
      }
    });

    plans = dbPlans.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      mealsPerDay: p.meals_per_day,
      servingsPerMeal: p.servings_per_meal,
      mealsPerMonth: p.meals_per_day * 30,
      rating: Number(p.rating) || 0,
      image: p.cover_image || "/placeholder-plan.jpg",
      kitchen: p.kitchen?.name || "Unknown Kitchen",
      type: p.meals_per_day >= 3 ? "Full Day" : p.meals_per_day >= 2 ? "Daily Plan" : "Single Meal",
    }));
  }

  // 3. Kitchens Fetching (Active only if tab is 'kitchens')
  let kitchens: any[] = [];
  if (tab === "kitchens") {
    const where: any = {
      isActive: true,
      isVerified: true,
      // Search logic
      OR: query ? [
        { name: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
        { area: { contains: query, mode: "insensitive" } },
        { type: { contains: query, mode: "insensitive" } }
      ] : undefined,
    };

    // Sorting logic
    const orderBy: any = {};
    if (sort === "rating") orderBy.rating = "desc";
    else orderBy.createdAt = "desc"; // Default sort

    const dbKitchens = await prisma.kitchen.findMany({
      where,
      orderBy
    });

    kitchens = dbKitchens.map(k => ({
      id: k.id,
      name: k.name,
      rating: Number(k.rating) || 0,
      reviews: k.reviewCount,
      image: k.coverImage || "/placeholder-kitchen.jpg",
      specialty: k.type || "Home Kitchen",
      isOpen: k.isOpen,
    }));
  }

  // Fetch user's favorites once to avoid multiple API calls
  const userId = await getAuthUserId();
  let favoriteDishIds = new Set<string>();
  let favoriteKitchenIds = new Set<string>();
  let favoritePlanIds = new Set<string>();

  if (userId) {
    const userFavorites = await prisma.favorite.findMany({
      where: { userId },
      select: {
        dishId: true,
        kitchenId: true,
        planId: true,
      },
    });

    userFavorites.forEach((fav) => {
      if (fav.dishId) favoriteDishIds.add(fav.dishId);
      if (fav.kitchenId) favoriteKitchenIds.add(fav.kitchenId);
      if (fav.planId) favoritePlanIds.add(fav.planId);
    });
  }

  // --- LEGACY FILTERING LOGIC (No longer needed) ---

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Header & Filters (Client Component) */}
      <FilterTabs categories={CATEGORIES} />

      {/* 2. Results Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Result Heading */}
        {query && (
          <p className="text-sm text-gray-500 mb-4">
            Showing results for{" "}
            <span className="font-bold text-gray-900">"{query}"</span>
          </p>
        )}

        {/* --- DISHES GRID --- */}
        {tab === "dishes" && (
          <>
            {dishes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {dishes.map((dish) => (
                  <DishCard key={dish.id} data={dish} isFavorite={favoriteDishIds.has(dish.id)} />
                ))}
              </div>
            ) : (
              <EmptyState type="Dish" />
            )}
          </>
        )}

        {/* --- KITCHENS GRID --- */}
        {tab === "kitchens" && (
          <>
            {kitchens.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kitchens.map((kitchen) => (
                  <KitchenCard key={kitchen.id} data={kitchen} isFavorite={favoriteKitchenIds.has(kitchen.id)} />
                ))}
              </div>
            ) : (
              <EmptyState type="Kitchen" />
            )}
          </>
        )}

        {/* --- SUBSCRIPTIONS GRID --- */}
        {tab === "subscriptions" && (
          <>
            {plans.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => (
                  <PlanCard key={plan.id} data={plan} isFavorite={favoritePlanIds.has(plan.id)} />
                ))}
              </div>
            ) : (
              <EmptyState type="Subscription" />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Simple Empty State Component
function EmptyState({ type }: { type: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-gray-200 p-4 rounded-full mb-4">
        <span className="text-4xl">🍳</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900">No {type}s Found</h3>
      <p className="text-gray-500 text-sm mt-1">
        Try changing your filters or search for something else.
      </p>
    </div>
  );
}
