import { WEEKLY_SCHEDULE_DATA } from "@/lib/dummy-data/schedule-data";
import { SUBSCRIPTION_DETAILS } from "@/lib/dummy-data/subscriptions";
import ScheduleHeader from "@/components/subscription/schedule/ScheduleHeader";
import DateSelector from "@/components/subscription/schedule/DateSelector";
import MealCard from "@/components/subscription/schedule/MealCard";
import SubscriptionHero from "@/components/subscription/SubscriptionHero";
import SubscriptionSettings from "@/components/subscription/SubscriptionSettings";
import { ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = WEEKLY_SCHEDULE_DATA;
  const sub = SUBSCRIPTION_DETAILS; // Fetch based on ID in real app

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8 md:p-8 space-y-8">
        
        {/* Back Nav */}
        <Link
          href="/profile/my-subscription"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft size={16} /> Back to My Subscriptions
        </Link>

        {/* Subscription Hero - Static Info */}
        <SubscriptionHero sub={sub} />
        
        {/* 1. Header */}
        <ScheduleHeader planName={data.planName} currentWeek={data.currentWeek} />

        {/* 2. Date Tabs */}
        <DateSelector dates={data.dates} />

        {/* 3. Timeline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[100px_1fr] gap-0">
          
          {/* Vertical Timeline Container */}
          <div className="relative col-span-2">
            
            {/* The Vertical Line (Desktop only) */}
            <div className="hidden lg:block absolute left-[49px] top-0 bottom-0 w-0.5 bg-teal-100"></div>

            {/* Meal Cards Loop */}
            {data.meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}

          </div>
        </div>

        {/* 4. Footer Info */}
        <div className="mt-8 p-6 bg-teal-50 border border-teal-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-teal-700 shadow-sm">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <p className="text-sm font-bold text-teal-900 tracking-tight">Modification Window</p>
              <p className="text-xs text-teal-600">You can skip or modify meals until 6 hours before delivery.</p>
            </div>
          </div>
          <button className="w-full md:w-auto px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors shadow-sm">
             View Full Month Calendar
          </button>
        </div>

        {/* Subscription Settings - Pause/Cancel */}
        <SubscriptionSettings />

      </div>
    </main>
  );
}