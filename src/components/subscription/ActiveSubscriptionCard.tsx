"use client";

import { PauseCircle, Utensils, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ActiveSubscriptionCard({
  subscription,
}: {
  subscription: any;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image Side */}
        <div className="relative shrink-0">
          <div className="w-full md:w-48 aspect-video md:aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-inner">
            <Image
              src={subscription.planImage}
              alt={subscription.planName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <span
            className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider text-white ${
              subscription.status === "Active" ? "bg-teal-700" : "bg-orange-600"
            }`}
          >
            {subscription.status}
          </span>
        </div>

        {/* Info Side */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 leading-tight">
                  {subscription.planName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="relative w-5 h-5 rounded-full overflow-hidden border border-gray-200">
                    <Image
                      src={subscription.chefImage}
                      alt="chef"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Chef:{" "}
                    <span className="font-semibold text-teal-700">
                      {subscription.chefName}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Next Delivery Info Box */}
            <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-yellow-400 mt-4">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  Next Delivery
                </p>
                <p className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                  Renew: {subscription.renewalDate}
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {subscription.nextDelivery}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Utensils size={12} />
                {subscription.nextDish}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              href={`/profile/my-subscription/${subscription.id}/schedule`}
              className="bg-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-teal-800 transition-colors"
            >
              View Schedule
            </Link>
            <button className="bg-gray-100 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1">
              <PauseCircle size={14} /> Pause
            </button>
            <button className="text-gray-400 hover:text-red-500 text-xs font-bold px-2 py-2 transition-colors flex items-center gap-1">
              <XCircle size={14} /> Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
