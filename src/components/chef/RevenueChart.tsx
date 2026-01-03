"use client";

import { TrendingUp } from "lucide-react";
import { useMemo } from "react";

interface RevenueData {
  month: string;
  revenue: number;
}

interface RevenueChartProps {
  data?: RevenueData[];
  currency?: string;
  title?: string;
}

const defaultData: RevenueData[] = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 3800 },
  { month: "Mar", revenue: 5200 },
  { month: "Apr", revenue: 4800 },
  { month: "May", revenue: 6100 },
  { month: "Jun", revenue: 5900 },
  { month: "Jul", revenue: 7200 },
  { month: "Aug", revenue: 6800 },
  { month: "Sep", revenue: 7500 },
  { month: "Oct", revenue: 8200 },
  { month: "Nov", revenue: 8900 },
  { month: "Dec", revenue: 9100 },
];

export default function RevenueChart({
  data = defaultData,
  currency = "৳",
  title = "Monthly Revenue",
}: RevenueChartProps) {
  const stats = useMemo(() => {
    const maxRevenue = Math.max(...data.map((d) => d.revenue));
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const avgRevenue = Math.round(totalRevenue / data.length);
    const lastMonthRevenue = data[data.length - 1]?.revenue || 0;
    const prevMonthRevenue = data[data.length - 2]?.revenue || 0;
    const growthRate =
      prevMonthRevenue > 0
        ? Math.round(((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
        : 0;

    return {
      maxRevenue,
      totalRevenue,
      avgRevenue,
      growthRate,
    };
  }, [data]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <TrendingUp size={20} className="text-teal-600" />
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total This Year</p>
          <p className="text-2xl font-bold text-gray-900">
            {currency} {(stats.totalRevenue / 1000).toFixed(1)}K
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8 pb-6 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Average Monthly
          </p>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {currency} {stats.avgRevenue.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Highest Month
          </p>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {currency} {stats.maxRevenue.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Growth vs Previous
          </p>
          <div className="flex items-center gap-1 mt-1">
            <p
              className={`text-lg font-bold ${
                stats.growthRate >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.growthRate >= 0 ? "+" : ""}
              {stats.growthRate}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-4">
        {/* Y-Axis Label */}
        <div className="flex items-end gap-3 h-60">
          {/* Y-Axis Values */}
          <div className="flex flex-col justify-between text-xs text-gray-400 font-medium min-w-fit pb-2">
            <span>{currency} {(stats.maxRevenue / 1000).toFixed(1)}K</span>
            <span>{currency} {(stats.maxRevenue / 2000).toFixed(1)}K</span>
            <span>0</span>
          </div>

          {/* Bars Container */}
          <div className="flex-1 flex items-end justify-between gap-2 px-2">
            {data.map((item) => {
              const heightPercentage = (item.revenue / stats.maxRevenue) * 100;
              return (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center group"
                >
                  {/* Bar */}
                  <div className="w-full relative h-48">
                    <div
                      className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-lg transition-all hover:from-teal-700 hover:to-teal-500 cursor-pointer shadow-sm"
                      style={{ height: `${heightPercentage}%` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                        {currency} {item.revenue.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* X-Axis Label */}
                  <p className="text-xs font-medium text-gray-600 mt-3">
                    {item.month}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid Lines (visual aid) */}
        <div className="relative mt-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      {/* Legend */}
      <div className="pt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-teal-600 to-teal-400" />
          <span className="text-gray-600">Monthly Revenue</span>
        </div>
      </div>
    </div>
  );
}
