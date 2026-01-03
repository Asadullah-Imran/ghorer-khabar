import SubscriptionCard from "@/components/subscription/SubscriptionCard";
import { ALL_SUBSCRIPTIONS } from "@/lib/dummy-data/subscriptions";
import { CalendarCheck, Package } from "lucide-react";
import Link from "next/link";

export default function AllSubscriptionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-teal-50 p-3 rounded-xl">
          <CalendarCheck className="text-teal-700" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            My Subscriptions
          </h1>
          <p className="text-sm text-gray-500">
            Manage your recurring meal plans
          </p>
        </div>
      </div>

      {/* List of Cards */}
      <div className="grid gap-6">
        {ALL_SUBSCRIPTIONS.map((sub) => (
          <SubscriptionCard key={sub.id} sub={sub} />
        ))}

        {/* CTA Card */}
        <Link
          href="/feed?category=plans"
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-teal-300 hover:bg-teal-50/50 transition-colors group"
        >
          <div className="bg-gray-50 group-hover:bg-white p-4 rounded-full mb-3 transition-colors">
            <Package
              className="text-gray-400 group-hover:text-teal-600"
              size={32}
            />
          </div>
          <h3 className="font-bold text-gray-900">Subscribe to a new plan</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            Save up to 20% on daily meals by subscribing to your favorite home
            chefs.
          </p>
        </Link>
      </div>
    </div>
  );
}
