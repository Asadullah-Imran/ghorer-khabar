import FilterTabs from "@/components/explore/FilterTabs";
import DishCard from "@/components/shared/DishCard";
import KitchenCard from "@/components/shared/KitchenCard";
import PlanCard from "@/components/shared/PlanCard";
import { getAuthUserId } from "@/lib/auth/getAuthUser";
// Categories will be fetched dynamically from DB
// import {
//     CATEGORIES
// } from "@/lib/dummy-data/explore";
import { prisma } from "@/lib/prisma/prisma";
import { calculateDistance, formatDistance, isValidCoordinates } from "@/lib/utils/distance";


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

  // 1. Fetch available tags and define categories for the filter UI
  const DISH_CATEGORIES = [
    { label: "All", value: "All" },
    { label: "🌅 Breakfast", value: "BREAKFAST" },
    { label: "🍛 Main Course", value: "MAIN_COURSE" },
    { label: "🥗 Side Dish", value: "SIDE_DISH" },
    { label: "🥟 Appetizer", value: "APPETIZER" },
    { label: "🍰 Dessert", value: "DESSERT" },
    { label: "🥤 Beverage", value: "BEVERAGE" },
    { label: "🍿 Snack", value: "SNACK" },
  ];

  const dbTagsData = await prisma.menu_items.findMany({
    where: { isAvailable: true },
    select: { tags: true },
  });
  
  const uniqueTags = [...new Set(dbTagsData.flatMap(t => t.tags))].sort();
  
  // Combine categories and tags for the filter UI
  const filterPills = [
    ...DISH_CATEGORIES.map(c => c.label),
    ...uniqueTags
  ];

  // Map display labels back to values/tags for the query
  const getFilterValue = (label: string) => {
    const cat = DISH_CATEGORIES.find(c => c.label === label);
    return cat ? cat.value : label;
  };

  const activeFilterValue = getFilterValue(category);


  // Get user info and coordinates for distance calculation
  const userId = await getAuthUserId();
  let userRole: string | null = null;
  let favoriteDishIds = new Set<string>();
  let favoriteKitchenIds = new Set<string>();
  let favoritePlanIds = new Set<string>();
  let userLat: number | null = null;
  let userLon: number | null = null;

  if (userId) {
    // Get user role and coordinates in parallel for better performance
    const [user, userAddress, userFavorites] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      }),
      prisma.address.findFirst({
        where: { userId },
        select: { latitude: true, longitude: true },
      }),
      prisma.favorite.findMany({
        where: { userId },
        select: {
          dishId: true,
          kitchenId: true,
          planId: true,
        },
      }),
    ]);

    userRole = user?.role || null;

    if (userAddress && isValidCoordinates(userAddress.latitude, userAddress.longitude)) {
      userLat = userAddress.latitude!;
      userLon = userAddress.longitude!;
    }

    userFavorites.forEach((fav) => {
      if (fav.dishId) favoriteDishIds.add(fav.dishId);
      if (fav.kitchenId) favoriteKitchenIds.add(fav.kitchenId);
      if (fav.planId) favoritePlanIds.add(fav.planId);
    });
  }

  // --- SERVER SIDE FETCHING ---
  
  // 1. Dishes Fetching (Active only if tab is 'dishes')
  let dishes: any[] = [];
  if (tab === "dishes") {
    // Build the where clause carefully
    const where: any = {
      isAvailable: true,
    };

    // Category/Tag filter
    if (activeFilterValue !== "All") {
      const isEnumCategory = [
        "BREAKFAST", "MAIN_COURSE", "SIDE_DISH", "APPETIZER", 
        "DESSERT", "BEVERAGE", "SNACK"
      ].includes(activeFilterValue);

      if (isEnumCategory) {
        where.category = activeFilterValue;
      } else {
        // Filter by tags if it's not a main category
        where.tags = { has: activeFilterValue };
      }
    }

    // Search logic
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { users: { kitchens: { some: { name: { contains: query, mode: "insensitive" } } } } }
      ];
    }

    // Kitchen status filter with zone
    const kitchenFilters: any = {
      isActive: true,
      isOpen: true,
      isVerified: true,
    };

    // Add zone filter if specified
    if (zone) {
      kitchenFilters.address = {
        zone: zone,
      };
    }

    where.users = {
      kitchens: {
        some: kitchenFilters,
      },
    };

    // Sorting logic
    const orderBy: any = {};
    if (sort === "price_asc") orderBy.price = "asc";
    else if (sort === "price_desc") orderBy.price = "desc";
    else if (sort === "rating") orderBy.rating = "desc";
    else orderBy.createdAt = "desc"; // Default sort

    try {
      const dbDishes = await prisma.menu_items.findMany({
        where,
        orderBy,
        take: 50, // Limit results for performance
        include: {
          menu_item_images: true,
          reviews: {
            select: {
              rating: true,
            },
          },
          users: {
            include: {
              kitchens: true,
            }
          }
        }
      });

      dishes = dbDishes.map(d => {
        // Calculate rating from actual reviews if they exist
        const calculatedRating = d.reviews.length > 0
          ? Math.round((d.reviews.reduce((sum, r) => sum + r.rating, 0) / d.reviews.length) * 10) / 10
          : (d.rating || 0);

        // Calculate distance if user and kitchen coordinates are available
        const kitchen = d.users.kitchens[0];
        let distance: string | undefined;
        
        if (userLat && userLon && kitchen && isValidCoordinates(kitchen.latitude, kitchen.longitude)) {
          const distanceKm = calculateDistance(userLat, userLon, kitchen.latitude!, kitchen.longitude!);
          distance = formatDistance(distanceKm);
        }

        return {
          id: d.id,
          name: d.name,
          price: d.price,
          rating: calculatedRating,
          image: d.menu_item_images[0]?.imageUrl || "/placeholder-dish.jpg",
          kitchen: kitchen?.name || "Unknown Kitchen",
          kitchenId: kitchen?.id || "unknown",
          kitchenName: kitchen?.name || "Unknown Kitchen",
          kitchenLocation: kitchen?.location || undefined,
          kitchenRating: Number(kitchen?.rating) || 0,
          kitchenReviewCount: kitchen?.reviewCount || 0,
          deliveryTime: "30-45 min", // Placeholder as it's not in schema currently
          distance, // Add distance
          chefId: d.chef_id // Chef/creator ID for permission checking
        };
      });
    } catch (error) {
      console.error("Error fetching dishes:", error);
    }
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
    };

    // Search logic
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { kitchen: { name: { contains: query, mode: "insensitive" } } }
      ];
    }

    // Sorting logic
    const orderBy: any = {};
    if (sort === "price_asc") orderBy.price = "asc";
    else if (sort === "price_desc") orderBy.price = "desc";
    else if (sort === "rating") orderBy.rating = "desc";
    else orderBy.subscriber_count = "desc"; // Default: most popular

    try {
      const dbPlans = await prisma.subscription_plans.findMany({
        where,
        orderBy,
        take: 50,
        include: {
          kitchen: {
            select: {
              id: true,
              name: true,
              rating: true,
              location: true,
              latitude: true,
              longitude: true,
            }
          }
        }
      });

      plans = dbPlans.map(p => {
        // Calculate distance if kitchen coordinates are available
        let distance: string | undefined;
        
        if (userLat && userLon && p.kitchen && isValidCoordinates(p.kitchen.latitude, p.kitchen.longitude)) {
          const distanceKm = calculateDistance(userLat, userLon, p.kitchen.latitude!, p.kitchen.longitude!);
          distance = formatDistance(distanceKm);
        }

        return {
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
          distance, // Add distance
        };
      });
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
    }
  }

  // 3. Kitchens Fetching (Active only if tab is 'kitchens')
  let kitchens: any[] = [];
  if (tab === "kitchens") {
    const where: any = {
      isActive: true,
      isVerified: true,
    };

    // Search logic
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
        { area: { contains: query, mode: "insensitive" } },
        { type: { contains: query, mode: "insensitive" } }
      ];
    }

    // Sorting logic
    const orderBy: any = {};
    if (sort === "rating") orderBy.rating = "desc";
    else orderBy.createdAt = "desc"; // Default sort

    try {
      const dbKitchens = await prisma.kitchen.findMany({
        where,
        orderBy,
        take: 50,
      });

      kitchens = dbKitchens.map(k => {
        // Calculate distance if coordinates are available
        let distanceStr: string | undefined;
        
        if (userLat && userLon && isValidCoordinates(k.latitude, k.longitude)) {
          const distanceKm = calculateDistance(userLat, userLon, k.latitude!, k.longitude!);
          distanceStr = formatDistance(distanceKm);
        }

        return {
          id: k.id,
          name: k.name,
          rating: Number(k.rating) || 0,
          reviews: k.reviewCount,
          image: k.coverImage || "/placeholder-kitchen.jpg",
          specialty: k.type || "Home Kitchen",
          isOpen: k.isOpen,
          distanceStr, // Add distance
        };
      });
    } catch (error) {
      console.error("Error fetching kitchens:", error);
    }
  }

  // --- LEGACY FILTERING LOGIC (No longer needed) ---

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Header & Filters (Client Component) */}
      <FilterTabs categories={filterPills} />

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
                  <DishCard 
                    key={dish.id} 
                    data={dish} 
                    isFavorite={favoriteDishIds.has(dish.id)}
                    currentUserId={userId}
                    userRole={userRole}
                  />
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
