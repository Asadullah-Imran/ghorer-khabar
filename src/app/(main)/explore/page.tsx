import FilterTabs from "@/components/explore/FilterTabs";
import DishCard from "@/components/shared/DishCard";
import KitchenCard from "@/components/shared/KitchenCard";
import PlanCard from "@/components/shared/PlanCard";
import {
  ALL_KITCHENS,
  ALL_PLANS,
  CATEGORIES,
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

  // --- LEGACY FILTERING LOGIC (For other tabs still using dummy data) ---

  const filteredKitchens = ALL_KITCHENS.filter((k) =>
    k.name.toLowerCase().includes(query.toLowerCase())
  );

  // PLANS Filter
  const filteredPlans = ALL_PLANS.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.kitchen.toLowerCase().includes(query.toLowerCase())
  );

  // Subscriptions logic (Sorting)
  if (tab === "subscriptions") {
     if (sort === "price_asc") filteredPlans.sort((a, b) => a.price - b.price);
     if (sort === "price_desc") filteredPlans.sort((a, b) => b.price - a.price);
     if (sort === "rating") filteredPlans.sort((a, b) => b.rating - a.rating);
  } else {
     // Kitchen sorting
     if (sort === "rating") filteredKitchens.sort((a, b) => b.rating - a.rating);
  }

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
                  <DishCard key={dish.id} data={dish} />
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
            {filteredKitchens.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredKitchens.map((kitchen) => (
                  <KitchenCard key={kitchen.id} data={kitchen} />
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
            {filteredPlans.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredPlans.map((plan) => (
                  <PlanCard key={plan.id} data={plan} />
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
