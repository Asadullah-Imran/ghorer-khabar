import FeedGreeting from "@/components/feed/FeedGreeting";
import DishCard from "@/components/shared/DishCard";
import KitchenCard from "@/components/shared/KitchenCard";
import PlanCard from "@/components/shared/PlanCard";
import SectionHeader from "@/components/shared/SectionHeader";
import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";


export default async function FeedPage() {
  const userId = await getAuthUserId();
  let userName = "Foodie";

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    if (user?.name) {
      userName = user.name.split(" ")[0]; // Use first name
    }
  }

  const menuItems = await prisma.menu_items.findMany({
    include: {
      menu_item_images: true,
      users: {
        include: {
          kitchens: true,
        },
      },
      // Check if ratings/reviews are on menu_items directly based on schema
    },
    take: 10, // Limit for now
  });

  const dishes = menuItems.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    rating: item.rating || 0,
    image: item.menu_item_images[0]?.imageUrl || "/placeholder-dish.jpg", // Fallback image
    kitchen: item.users.kitchens[0]?.name || "Unknown Kitchen",
    kitchenId: item.users.kitchens[0]?.id || "unknown",
    kitchenName: item.users.kitchens[0]?.name || "Unknown Kitchen",
    kitchenLocation: item.users.kitchens[0]?.location || undefined, // Provide fallback? or undefined is fine
    kitchenRating: Number(item.users.kitchens[0]?.rating) || 0,
    kitchenReviewCount: item.users.kitchens[0]?.reviewCount || 0,
    deliveryTime: "30-45 min", // hardcoded for now as it's not on menu_item directly, maybe calc from kitchen?
  }));

  // Fetch featured subscription plans from database
  const subscriptionPlans = await prisma.subscription_plans.findMany({
    where: { is_active: true },
    include: {
      kitchen: {
        select: {
          id: true,
          name: true,
          rating: true,
          location: true,
        },
      },
    },
    orderBy: { subscriber_count: 'desc' }, // Show most popular first
    take: 6, // Show top 6 featured plans
  });

  const featuredPlans = subscriptionPlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: plan.price,
    mealsPerDay: plan.meals_per_day,
    servingsPerMeal: plan.servings_per_meal,
    mealsPerMonth: plan.meals_per_day * 30,
    rating: Number(plan.rating) || 0,
    image: plan.cover_image || "/placeholder-plan.jpg",
    kitchen: plan.kitchen?.name || "Unknown Kitchen",
    type: plan.meals_per_day >= 3 ? "Full Day" : plan.meals_per_day >= 2 ? "Daily Plan" : "Single Meal",
  }));

  // Fetch top-rated kitchens from database
  const topKitchensData = await prisma.kitchen.findMany({
    where: {
      isActive: true,
      isVerified: true
    },
    orderBy: {
      rating: 'desc'
    },
    take: 8
  });

  const topKitchens = topKitchensData.map((kitchen) => ({
    id: kitchen.id,
    name: kitchen.name,
    rating: Number(kitchen.rating) || 0,
    reviews: kitchen.reviewCount,
    image: kitchen.coverImage || "/placeholder-kitchen.jpg",
    specialty: kitchen.type || "Home Kitchen"
  }));


  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 1. Welcome Section */}
      <section className="bg-white border-b border-gray-100 py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <FeedGreeting name={userName} />
        </div>
      </section>

      <div className="max-w-7xl mx-auto space-y-10 py-8">
        {/* 2. Weekly Best Dishes */}
        <section>
          <SectionHeader
            title="Weekly Best Dishes"
            subtitle="Most loved by foodies this week"
            href="/explore?tab=dishes&sort=weekly_best"
          />
          <div className="flex overflow-x-auto gap-4 px-4 md:px-0 pb-4 scrollbar-hide snap-x">
             {/* Using fetched dishes for now as 'Weekly Best' */}
            {dishes.map((dish) => (
              <div key={dish.id} className="snap-center">
                <DishCard data={dish} featured={true} />
              </div>
            ))}
          </div>
        </section>

        {/* 3. Monthly Top Kitchens */}
        <section>
          <SectionHeader
            title="Top Kitchens of January"
            subtitle="Cleanest kitchens with 5-star ratings"
            href="/explore?tab=kitchens&sort=top_rated"
          />
          <div className="flex overflow-x-auto gap-4 px-4 md:px-0 pb-4 scrollbar-hide snap-x">
            {topKitchens.map((kitchen) => (
              <div key={kitchen.id} className="snap-center">
                <KitchenCard data={kitchen} />
              </div>
            ))}
          </div>
        </section>

        {/* 4. Featured Subscription Plans */}
        <section>
          <SectionHeader
            title="Monthly Meal Plans"
            subtitle="Save time & money with recurring meals"
            href="/explore?tab=subscriptions"
          />
          <div className="flex overflow-x-auto gap-4 px-4 md:px-0 pb-4 scrollbar-hide snap-x">
            {featuredPlans.map((plan) => (
              <div key={plan.id} className="snap-center min-w-[280px]">
                <PlanCard data={plan} />
              </div>
            ))}
          </div>
        </section>

        {/* 5. Recommended For You (Grid) */}
        <section className="px-4 md:px-0">
          <SectionHeader
            title="Recommended For You"
            subtitle="Based on your spice preferences"
            href="/explore?tab=dishes&filter=recommended"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dishes.map((dish) => (
              <DishCard key={dish.id} data={dish} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <a
              href="/explore"
              className="inline-block px-8 py-3 bg-white border border-gray-200 text-gray-600 font-medium rounded-full hover:bg-gray-50 transition shadow-sm"
            >
              Explore All Dishes
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
