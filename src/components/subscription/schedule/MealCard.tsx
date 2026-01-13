"use client";

import { Ban, SlidersHorizontal, Info } from "lucide-react";
import Image from "next/image";

// Helper to render lucide icons dynamically if needed, 
// or stick to hardcoded mapping for simplicity in this demo.
import { Sunrise, Sun, Moon, Cookie } from "lucide-react";

const IconMap: any = {
  wb_twilight: Sunrise,
  sunny: Sun,
  cookie: Cookie,
  dark_mode: Moon,
};

export default function MealCard({ meal }: { meal: any }) {
  const Icon = IconMap[meal.icon] || Sun;

  // Empty State (e.g. Snacks not included)
  if (!meal.dishName) {
    return (
      <div className="relative flex flex-col lg:flex-row gap-6 lg:gap-12 mb-12 opacity-70">
        <div className="flex items-center lg:flex-col lg:w-24 shrink-0 gap-4 lg:gap-2">
          <div className="z-10 w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 ring-8 ring-white">
            <Icon size={24} />
          </div>
          <div className="lg:text-center">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">{meal.time}</p>
            <p className="text-sm font-medium text-gray-400">{meal.type}</p>
          </div>
        </div>
        
        <div className="flex-1 bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200 flex flex-col md:flex-row gap-6 items-center justify-center text-center italic">
           <div>
             <p className="text-teal-700 font-bold flex items-center justify-center gap-2 mb-1">
               <Info size={16} /> No {meal.type} Scheduled
             </p>
             <p className="text-sm text-gray-500">{meal.description}</p>
             <button className="mt-2 text-teal-700 text-xs font-bold underline decoration-2 underline-offset-4">
                Upgrade to include {meal.type}
             </button>
           </div>
        </div>
      </div>
    );
  }

  // Active Meal Card
  return (
    <div className="relative flex flex-col lg:flex-row gap-6 lg:gap-12 mb-12">
      {/* Timeline Node */}
      <div className="flex items-center lg:flex-col lg:w-24 shrink-0 gap-4 lg:gap-2">
        <div className="z-10 w-12 h-12 rounded-full bg-teal-700 flex items-center justify-center text-white ring-8 ring-white shadow-sm">
          <Icon size={24} />
        </div>
        <div className="lg:text-center">
          <p className="text-xs font-black uppercase tracking-widest text-teal-700">{meal.time}</p>
          <p className="text-sm font-medium text-gray-500">{meal.type}</p>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow group">
        
        {/* Dish Image */}
        <div className="w-full md:w-56 h-40 rounded-xl overflow-hidden shrink-0 relative bg-gray-100">
           <Image src={meal.image} alt={meal.dishName} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>

        {/* Dish Details */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {meal.tags.map((tag: any, i: number) => (
                <span 
                    key={i} 
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        tag.color === 'primary' ? 'bg-teal-50 text-teal-700' : 
                        tag.color === 'blue' ? 'bg-blue-50 text-blue-700' :
                        tag.color === 'green' ? 'bg-green-50 text-green-700' :
                        'bg-orange-50 text-orange-700'
                    }`}
                >
                    {tag.label}
                </span>
              ))}
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">
              {meal.dishName}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
              {meal.description}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-black font-bold text-xs hover:bg-yellow-500 transition-all shadow-sm">
              <Ban size={14} /> Skip this Meal
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-teal-700 font-bold text-xs hover:bg-teal-50 transition-all">
              <SlidersHorizontal size={14} /> Modify Dish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}