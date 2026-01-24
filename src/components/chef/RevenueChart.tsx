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
  isLoading?: boolean;
}

// Static month structure - always rendered
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Default empty data structure - static, doesn't need to load
const getEmptyData = (): RevenueData[] => {
  return MONTHS.map((month) => ({ month, revenue: 0 }));
};

export default function RevenueChart({
  data,
  currency = "৳",
  title = "Monthly Revenue",
  isLoading = false,
}: RevenueChartProps) {
  // Use provided data or empty structure - chart structure is always static
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return getEmptyData();
    }
    // Ensure we have all 12 months, fill missing ones with 0
    const dataMap = new Map(data.map((d) => [d.month, d.revenue]));
    return MONTHS.map((month) => ({
      month,
      revenue: dataMap.get(month) || 0,
    }));
  }, [data]);

  const stats = useMemo(() => {
    const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1); // Min 1 to avoid division by zero
    const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
    const avgRevenue = Math.round(totalRevenue / chartData.length);
    const lastMonthRevenue = chartData[chartData.length - 1]?.revenue || 0;
    const prevMonthRevenue = chartData[chartData.length - 2]?.revenue || 0;
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
  }, [chartData]);

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
            {isLoading ? (
              <span className="inline-block h-8 w-20 bg-gray-200 rounded animate-pulse" />
            ) : (
              `${currency} ${(stats.totalRevenue / 1000).toFixed(1)}K`
            )}
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
            {isLoading ? (
              <span className="inline-block h-6 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              `${currency} ${stats.avgRevenue.toLocaleString()}`
            )}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Highest Month
          </p>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {isLoading ? (
              <span className="inline-block h-6 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              `${currency} ${stats.maxRevenue.toLocaleString()}`
            )}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Growth vs Previous
          </p>
          <div className="flex items-center gap-1 mt-1">
            {isLoading ? (
              <span className="inline-block h-6 w-12 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p
                className={`text-lg font-bold ${
                  stats.growthRate >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.growthRate >= 0 ? "+" : ""}
                {stats.growthRate}%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-4">
        {/* Y-Axis Label */}
        <div className="flex items-end gap-3 h-60">
          {/* Y-Axis Values - Static structure, dynamic values */}
          <div className="flex flex-col justify-between text-xs text-gray-400 font-medium min-w-fit pb-2">
            {isLoading ? (
              <>
                <span className="inline-block h-4 w-12 bg-gray-200 rounded animate-pulse" />
                <span className="inline-block h-4 w-12 bg-gray-200 rounded animate-pulse" />
                <span>0</span>
              </>
            ) : (
              <>
                <span>{currency} {(stats.maxRevenue / 1000).toFixed(1)}K</span>
                <span>{currency} {(stats.maxRevenue / 2000).toFixed(1)}K</span>
                <span>0</span>
              </>
            )}
          </div>

          {/* Bars Container - Static structure, only values update */}
          <div className="flex-1 flex items-end justify-between gap-2 px-2">
            {chartData.map((item) => {
              const heightPercentage = stats.maxRevenue > 0 
                ? (item.revenue / stats.maxRevenue) * 100 
                : 0;
              const isZero = item.revenue === 0;
              
              return (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center group"
                >
                  {/* Bar - Always rendered, height updates with data */}
                  <div className="w-full relative h-48 flex items-end">
                    {isLoading && isZero ? (
                      <div className="w-full h-2 bg-gray-200 rounded-t-lg animate-pulse" />
                    ) : (
                      <div
                        className={`w-full rounded-t-lg transition-all ${
                          isZero 
                            ? "bg-gray-100" 
                            : "bg-gradient-to-t from-teal-600 to-teal-400 hover:from-teal-700 hover:to-teal-500 cursor-pointer shadow-sm"
                        }`}
                        style={{ height: `${Math.max(heightPercentage, 2)}%` }} // Min 2% so bar is visible even when 0
                      >
                        {/* Tooltip - Only show if not zero */}
                        {!isZero && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                            {currency} {item.revenue.toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* X-Axis Label - Static, always visible */}
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
