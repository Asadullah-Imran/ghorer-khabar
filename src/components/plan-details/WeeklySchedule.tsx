"use client";

import { ChevronLeft, ChevronRight, Moon, Sun, Sunrise } from "lucide-react";
import { useState } from "react";

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function WeeklySchedule({ schedule }: { schedule: any }) {
  console.log("🔍 WeeklySchedule - Full schedule data:", schedule);
  
  const [activeDay, setActiveDay] = useState("Saturday");
  
  // Fallback if day data is missing in dummy data
  const daySchedule = schedule[activeDay] || {};
  console.log(`📅 Active day: ${activeDay}, Day schedule:`, daySchedule); 

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Weekly Meal Schedule</h2>
        <div className="flex gap-2">
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => {
              console.log(`🔄 Switching to day: ${day}`);
              setActiveDay(day);
            }}
            className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
              activeDay === day
                ? "bg-teal-700 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-teal-700"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Meal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["breakfast", "lunch", "dinner"].map((type) => {
          const meal = daySchedule[type];
          console.log(`🍽️ ${activeDay} - ${type}:`, meal);
          console.log(`🖼️ ${activeDay} - ${type} image:`, meal?.image);
          if (!meal) {
            console.log(`⚠️ No meal data for ${activeDay} - ${type}`);
            return null;
          }

          return (
            <div key={type} className="group cursor-pointer">
              <div className="relative h-48 rounded-xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow bg-gray-100">
                <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 z-10">
                   {type === 'breakfast' && <Sunrise size={12}/>}
                   {type === 'lunch' && <Sun size={12}/>}
                   {type === 'dinner' && <Moon size={12}/>}
                   {type} • {meal.time}
                </div>
                <div 
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                    style={{ backgroundImage: `url(${meal.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80"})` }}
                ></div>
              </div>
              <h3 className="font-bold text-lg mb-1 text-gray-900 group-hover:text-teal-700 transition-colors capitalize">
                {meal.dish || "Chef's Special"}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {meal.desc || "A delicious surprise prepared by the chef."}
              </p>
            </div>
          );
        })}
        {Object.keys(daySchedule).length === 0 && (
            <div className="col-span-3 text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No menu scheduled for this day yet.
            </div>
        )}
      </div>
    </section>
  );
}