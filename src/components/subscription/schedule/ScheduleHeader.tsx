"use client";

import { Calendar, CheckCircle, Edit, FileText } from "lucide-react";

export default function ScheduleHeader({ planName, currentWeek }: { planName: string, currentWeek: string }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-teal-700 font-bold text-sm tracking-widest uppercase">
          <CheckCircle size={16} />
          Active Subscription
        </div>
        <h1 className="text-gray-900 text-3xl md:text-4xl font-black tracking-tight">{planName}</h1>
        <p className="text-gray-500 text-lg flex items-center gap-2">
          <Calendar size={20} />
          {currentWeek}
        </p>
      </div>
      
      <div className="flex gap-3">
        <button className="px-5 py-2.5 rounded-lg border border-teal-700 text-teal-700 font-bold text-sm hover:bg-teal-50 transition-all flex items-center gap-2">
          <Edit size={18} />
          Manage Plan
        </button>
        <button className="px-5 py-2.5 rounded-lg bg-teal-700 text-white font-bold text-sm hover:bg-teal-800 shadow-lg shadow-teal-700/20 transition-all flex items-center gap-2">
          <FileText size={18} />
          Billing History
        </button>
      </div>
    </div>
  );
}