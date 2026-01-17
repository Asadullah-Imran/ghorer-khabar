"use client";

import { PauseCircle, Utensils, XCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ActiveSubscriptionCard({
  subscription,
}: {
  subscription: any;
}) {
  const router = useRouter();

  const handleViewClick = () => {
    // If PENDING, redirect to success/tracking page
    if (subscription.status === "PENDING") {
      router.push(`/subscriptions/success/${subscription.id}`);
    } else {
      // If ACTIVE or PAUSED, redirect to schedule page
      router.push(`/profile/my-subscription/${subscription.id}/schedule`);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { bg: "bg-teal-700", text: "Active" };
      case "PENDING":
        return { bg: "bg-orange-500", text: "Pending Approval" };
      case "PAUSED":
        return { bg: "bg-gray-500", text: "Paused" };
      default:
        return { bg: "bg-gray-400", text: status };
    }
  };

  const statusConfig = getStatusConfig(subscription.status);

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
            className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider text-white ${statusConfig.bg}`}
          >
            {statusConfig.text}
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

            {/* Next Delivery Info Box OR Pending Message */}
            {subscription.status === "PENDING" ? (
              <div className="bg-orange-50 p-4 rounded-xl border-l-4 border-orange-500 mt-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-orange-500 text-sm">schedule</span>
                  <p className="text-xs text-orange-700 font-bold uppercase tracking-wider">
                    Awaiting Chef Confirmation
                  </p>
                </div>
                <p className="text-sm text-gray-700 mt-2">
                  Your subscription request has been sent to the chef. You'll be notified once they confirm your slot.
                </p>
              </div>
            ) : (
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
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={handleViewClick}
              className="bg-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-teal-800 transition-colors"
            >
              {subscription.status === "PENDING" ? "View Status" : "View Schedule"}
            </button>
            
            {subscription.status === "ACTIVE" && (
              <>
                <button className="bg-gray-100 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1">
                  <PauseCircle size={14} /> Pause
                </button>
                <button className="text-gray-400 hover:text-red-500 text-xs font-bold px-2 py-2 transition-colors flex items-center gap-1">
                  <XCircle size={14} /> Cancel
                </button>
              </>
            )}
            
            {subscription.status === "PENDING" && (
              <button className="text-gray-400 hover:text-red-500 text-xs font-bold px-5 py-2.5 transition-colors flex items-center gap-1">
                <XCircle size={14} /> Withdraw Request
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
