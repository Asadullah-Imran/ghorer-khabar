import DishCard from "@/components/shared/DishCard";
import KitchenCard from "@/components/shared/KitchenCard";
import PlanCard from "@/components/shared/PlanCard"; // 1. Import PlanCard
import SectionHeader from "@/components/shared/SectionHeader";
import {
  
  MONTHLY_TOP_KITCHENS,
  RECOMMENDED_DISHES,
  WEEKLY_BEST_DISHES,
} from "@/lib/dummy-data/feed";
import { FEATURED_PLANS } from "@/lib/dummy-data/newSubscriptionData";

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 1. Welcome Section */}
      <section className="bg-white border-b border-gray-100 py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold text-teal-900">
            Good Afternoon, <span className="text-yellow-500">Asad!</span> 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Ready to taste something homemade today?
          </p>
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
            {WEEKLY_BEST_DISHES.map((dish) => (
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
            {MONTHLY_TOP_KITCHENS.map((kitchen) => (
              <div key={kitchen.id} className="snap-center">
                <KitchenCard data={kitchen} />
              </div>
            ))}
          </div>
        </section>

        {/* 4. NEW: Featured Subscription Plans */}
        <section>
          <SectionHeader
            title="Monthly Meal Plans"
            subtitle="Save time & money with recurring meals"
            href="/explore?tab=plans"
          />
          <div className="flex overflow-x-auto gap-4 px-4 md:px-0 pb-4 scrollbar-hide snap-x">
            {FEATURED_PLANS.map((plan) => (
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
            {RECOMMENDED_DISHES.map((dish) => (
              <DishCard key={dish.id} data={dish} />
            ))}
            {/* Duplicate for demo grid */}
            {RECOMMENDED_DISHES.map((dish) => (
              <DishCard key={`dup-${dish.id}`} data={dish} />
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
