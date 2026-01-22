"use client";

import SubscriptionFlowManager from "@/components/subscriptions/SubscriptionFlowManager";
import { ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function SubscriptionSidebar({ 
  plan, 
  kitchenSellerId, 
  currentUserId,
  kitchenId
}: { 
  plan: any;
  kitchenSellerId?: string | null;
  currentUserId?: string | null;
  kitchenId?: string | null;
}) {
  const isOwnKitchen = !!(currentUserId && kitchenSellerId && currentUserId === kitchenSellerId);
  return (
    <aside className="w-full lg:w-[360px] space-y-6">
      {/* Pricing Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
        <div className="flex items-end gap-1 mb-2">
          <span className="text-3xl font-black text-gray-900">
            ৳{plan.price}
          </span>
          <span className="text-gray-500 mb-1">/ month</span>
        </div>
        <p className="text-gray-500 text-xs mb-6">+ ৳300 delivery fee</p>

        {/* Feature List */}
        <div className="space-y-3 mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
            <span className="text-sm text-gray-700">Eco-friendly packaging</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
            <span className="text-sm text-gray-700">Cancel or pause anytime</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
            <span className="text-sm text-gray-700">Add note for chef</span>
          </div>
        </div>

        <SubscriptionFlowManager
          planId={plan.id}
          planName={plan.name}
          planPrice={plan.price}
          chefName={plan.chef.name}
          chefQuote={plan.chef.quote}
          kitchenArea={plan.kitchen?.area}
          mealsPerDay={plan.mealsPerDay}
          servingsPerMeal={plan.servingsPerMeal}
          isOwnKitchen={isOwnKitchen}
          kitchenId={kitchenId || plan.kitchen?.id}
        />
        <p className="text-center text-xs text-gray-400 mt-4">
          Next delivery starts from Monday, 8:00 AM
        </p>
      </div>

      {/* Chef Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-teal-100">
            <Image
              src={plan.chef.image}
              alt={plan.chef.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{plan.chef.name}</h4>
            <p className="text-xs text-gray-500">
              {plan.chef.experience} of home cooking
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 italic leading-relaxed">
          "{plan.chef.quote}"
        </p>
      </div>

      {/* Promo */}
      <div className="bg-teal-800 rounded-2xl p-6 text-white text-center relative overflow-hidden group">
        <div className="relative z-10">
          <h4 className="font-bold mb-2">Refer a Colleague</h4>
          <p className="text-sm text-teal-100 mb-4">
            Get 20% off your next month for every successful referral.
          </p>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-bold py-2 px-4 rounded-full transition-colors">
            Copy Link
          </button>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform text-white">
          <ShieldCheck size={120} />
        </div>
      </div>
    </aside>
  );
}
