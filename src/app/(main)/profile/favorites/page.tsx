import FavoriteTabs from "@/components/profile/favorites/FavoriteTabs";
import DishCard from "@/components/shared/DishCard";
import KitchenCard from "@/components/shared/KitchenCard";
import PlanCard from "@/components/shared/PlanCard"; // Import the new card
import {
  FAVORITE_DISHES,
  FAVORITE_KITCHENS,
  FAVORITE_PLANS,
} from "@/lib/dummy-data/favorites";
import { ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function FavoritesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab = (params.tab as string) || "dishes";

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
            {FAVORITE_DISHES.length > 0 ? (
              FAVORITE_DISHES.map((dish) => (
                <DishCard key={dish.id} data={dish} />
              ))
            ) : (
              <EmptyState type="Dish" />
            )}
          </div>
        )}

        {/* --- KITCHENS TAB --- */}
        {tab === "kitchens" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FAVORITE_KITCHENS.length > 0 ? (
              FAVORITE_KITCHENS.map((kitchen) => (
                <KitchenCard key={kitchen.id} data={kitchen} />
              ))
            ) : (
              <EmptyState type="Kitchen" />
            )}
          </div>
        )}

        {/* --- SUBSCRIPTIONS TAB --- */}
        {tab === "subscriptions" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FAVORITE_PLANS.length > 0 ? (
              FAVORITE_PLANS.map((plan) => (
                <PlanCard key={plan.id} data={plan} />
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
