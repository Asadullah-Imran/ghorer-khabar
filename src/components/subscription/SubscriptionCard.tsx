// src/components/subscription/SubscriptionCard.tsx
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SubscriptionCard({ sub }: { sub: any }) {
  const progress = (sub.mealsDelivered / sub.totalMeals) * 100;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col md:flex-row hover:border-teal-200 transition-colors">
      {/* Image Side */}
      <div className="relative w-full md:w-48 h-48 md:h-auto bg-gray-100 shrink-0">
        <Image
          src={sub.image}
          alt={sub.planName}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-teal-800 uppercase tracking-wider">
          {sub.type}
        </div>
      </div>

      {/* Content Side */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-gray-900">{sub.planName}</h3>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                sub.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {sub.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Provided by{" "}
            <span className="text-teal-700 font-medium">{sub.kitchen}</span>
          </p>

          {/* Progress Bar */}
          <div className="mb-2 flex justify-between text-xs font-semibold text-gray-500">
            <span>Progress</span>
            <span>
              {sub.mealsDelivered} / {sub.totalMeals} Meals
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                sub.status === "Active" ? "bg-teal-500" : "bg-gray-400"
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="text-xs text-gray-400">
            {sub.status === "Active"
              ? `Renews on ${sub.renewalDate}`
              : `Ended on ${sub.renewalDate}`}
          </div>

          <Link
            href={`/profile/subscription/${sub.id}`}
            className="flex items-center gap-1 text-sm font-bold text-teal-700 hover:text-teal-900 hover:underline"
          >
            Manage Plan <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
