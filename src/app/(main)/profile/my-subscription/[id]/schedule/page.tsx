import { WEEKLY_SCHEDULE_DATA } from "@/lib/dummy-data/schedule-data";
import ScheduleHeader from "@/components/subscription/schedule/ScheduleHeader";
import DateSelector from "@/components/subscription/schedule/DateSelector";
import MealCard from "@/components/subscription/schedule/MealCard";
import { Zap } from "lucide-react";

export default function SchedulePage() {
  const data = WEEKLY_SCHEDULE_DATA;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8 md:p-8">
        
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

      </div>
    </main>
  );
}