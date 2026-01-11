"use client";

import { Check, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function SubscriptionSidebar({ plan }: { plan: any }) {
  return (
    <aside className="w-full lg:w-[360px] space-y-6">
      {/* Pricing Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
        <div className="flex items-end gap-1 mb-6">
          <span className="text-3xl font-black text-gray-900">
            ৳{plan.price}
          </span>
          <span className="text-gray-500 mb-1">/ month</span>
        </div>

        <div className="space-y-4 mb-8">
          {plan.features?.map((feature: string, i: number) => (
            <div key={i} className="flex items-center gap-3">
              <span className="bg-green-50 text-green-600 rounded-full p-1">
                <Check size={14} strokeWidth={3} />
              </span>
              <span className="text-sm font-medium text-gray-700">
                {feature}
              </span>
            </div>
          ))}
        </div>

        <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 rounded-xl text-lg transition-all shadow-md active:scale-95 mb-4">
          Subscribe Now
        </button>
        <p className="text-center text-xs text-gray-400">
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
