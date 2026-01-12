import ActiveSubscriptionCard from "@/components/subscription/ActiveSubscriptionCard";
import DeliveryCalendar from "@/components/subscription/DeliveryCalendar";
import SubscriptionHistory from "@/components/subscription/SubscriptionHistory";
import {
  MY_ACTIVE_SUBSCRIPTIONS,
  MY_SUBSCRIPTION_HISTORY,
  UPCOMING_DELIVERIES,
} from "@/lib/dummy-data/my-subscription-data";
import { BadgeCheck, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function MySubscriptionsPage() {
  return (
    <div className="max-w-[1200px] mx-auto p-6 md:p-10">
      {/* 1. Page Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-gray-900 text-3xl font-black tracking-tight">
            My Subscriptions
          </h1>
          <p className="text-gray-500 text-base">
            You have{" "}
            <span className="text-teal-700 font-bold">
              {MY_ACTIVE_SUBSCRIPTIONS.length} active plans
            </span>{" "}
            for this month.
          </p>
        </div>
        <Link
          href="/explore?tab=plans"
          className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-teal-700/20 flex items-center gap-2"
        >
          <PlusCircle size={20} />
          Browse New Plans
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Section: Active Subscriptions & History */}
        <div className="xl:col-span-2 flex flex-col gap-10">
          {/* Active List */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <BadgeCheck className="text-teal-700" size={24} />
              <h2 className="text-xl font-bold tracking-tight text-gray-900">
                Active Subscriptions
              </h2>
            </div>

            <div className="flex flex-col gap-6">
              {MY_ACTIVE_SUBSCRIPTIONS.map((subscription) => (
                <ActiveSubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                />
              ))}
            </div>
          </section>

          {/* History Table */}
          <SubscriptionHistory history={MY_SUBSCRIPTION_HISTORY} />
        </div>

        {/* Right Section: Delivery Calendar Widget */}
        <div className="xl:col-span-1">
          <DeliveryCalendar deliveries={UPCOMING_DELIVERIES} />
        </div>
      </div>
    </div>
  );
}
