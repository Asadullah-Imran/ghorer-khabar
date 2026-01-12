"use client";

import { useState } from "react";

export default function DateSelector({ dates }: { dates: any[] }) {
  const [selectedDate, setSelectedDate] = useState(dates[0].date);

  return (
    <div className="bg-white rounded-xl shadow-sm mb-10 overflow-hidden border border-gray-200">
      <div className="flex overflow-x-auto no-scrollbar scroll-smooth">
        {dates.map((dateObj) => {
          const isSelected = selectedDate === dateObj.date;
          return (
            <button
              key={dateObj.date}
              onClick={() => setSelectedDate(dateObj.date)}
              className={`flex-1 min-w-[100px] flex flex-col items-center justify-center py-6 border-b-4 transition-all ${
                isSelected
                  ? "border-teal-700 bg-teal-50 text-teal-700"
                  : "border-transparent text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">
                {dateObj.day}
              </span>
              <span className="text-2xl font-black">{dateObj.date}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}