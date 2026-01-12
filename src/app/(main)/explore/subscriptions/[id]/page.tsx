import NutritionInfo from "@/components/plan-details/NutritionInfo";
import PlanHero from "@/components/plan-details/PlanHero";
import PlanStats from "@/components/plan-details/PlanStats";
import SubscriptionSidebar from "@/components/plan-details/SubscriptionSidebar";
import WeeklySchedule from "@/components/plan-details/WeeklySchedule";
import { getPlanById } from "@/lib/dummy-data/newSubscriptionData";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PlanDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = getPlanById(id);

  if (!plan) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-sm font-medium text-gray-500">
          <Link href="/feed" className="hover:text-teal-700">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/explore?tab=subscriptions" className="hover:text-teal-700">
            Subscription Plans
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-semibold">{plan.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column: Content */}
          <div className="flex-1 space-y-10">
            <PlanHero plan={plan} />
            <PlanStats plan={plan} />
            <WeeklySchedule schedule={plan.schedule || {}} />
            <NutritionInfo nutrition={plan.nutrition} />
          </div>

          {/* Right Column: Sticky Sidebar */}
          <SubscriptionSidebar plan={plan} />
        </div>
      </div>
    </main>
  );
}
