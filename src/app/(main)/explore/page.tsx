import FilterTabs from "@/components/explore/FilterTabs";
import DishCard from "@/components/shared/DishCard";
import KitchenCard from "@/components/shared/KitchenCard";
import { ALL_DISHES, ALL_KITCHENS, CATEGORIES } from "@/lib/dummy-data/explore";

// Define the type for URL search params
interface SearchParamsProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ExplorePage({ searchParams }: SearchParamsProps) {
  // Await searchParams before accessing properties (Next.js 15 requirement, good practice generally)
  const params = await searchParams;

  const tab = (params.tab as string) || "dishes";
  const category = (params.category as string) || "All";
  const sort = (params.sort as string) || "recommended";
  const query = (params.q as string) || ""; // For text search

  // --- FILTERING LOGIC (Server Side) ---

  // 1. Filter by Tab & Text Search
  let filteredDishes = ALL_DISHES.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.kitchen.toLowerCase().includes(query.toLowerCase())
  );

  const filteredKitchens = ALL_KITCHENS.filter((k) =>
    k.name.toLowerCase().includes(query.toLowerCase())
  );

  // 2. Filter by Category (Dishes only)
  if (tab === "dishes" && category !== "All") {
    filteredDishes = filteredDishes.filter((d) => d.category === category);
  }

  // 3. Sorting Logic
  if (tab === "dishes") {
    if (sort === "price_asc") filteredDishes.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") filteredDishes.sort((a, b) => b.price - a.price);
    if (sort === "rating") filteredDishes.sort((a, b) => b.rating - a.rating);
  } else {
    // Kitchen sorting (usually just rating)
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
            {filteredDishes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredDishes.map((dish) => (
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
      <h3 className="text-lg font-bold text-gray-900">No {type}es Found</h3>
      <p className="text-gray-500 text-sm mt-1">
        Try changing your filters or search for something else.
      </p>
    </div>
  );
}
