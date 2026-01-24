"use client";

import { TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

interface RevenueData {
  month: string;
  revenue: number;
  year?: number;
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

type TimeRangeFilter = "thisYear" | "lastYear";

export default function RevenueChart({
  data,
  currency = "৳",
  title = "Monthly Revenue",
  isLoading = false,
}: RevenueChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>("thisYear");
  const currentYear = new Date().getFullYear();

  // Use provided data or empty structure - chart structure is always static
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return getEmptyData();
    }

    // Filter data based on selected time range
    let filteredData = data;
    
    if (timeRange === "thisYear") {
      // Full current year
      filteredData = data.filter(d => (d.year || currentYear) === currentYear);
    } else if (timeRange === "lastYear") {
      // Full previous year
      filteredData = data.filter(d => (d.year || currentYear) === currentYear - 1);
    }

    // Ensure we have all 12 months, fill missing ones with 0
    const dataMap = new Map(filteredData.map((d) => [d.month, d.revenue]));
    return MONTHS.map((month) => ({
      month,
      revenue: dataMap.get(month) || 0,
    }));
  }, [data, timeRange, currentYear]);

  const stats = useMemo(() => {
    const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1); // Min 1 to avoid division by zero
    const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
    const avgRevenue = Math.round(totalRevenue / chartData.length);
    
    // Find highest month with year
    const highestMonthData = chartData.reduce((max, current) => 
      current.revenue > max.revenue ? current : max
    , chartData[0]);
    
    // Get revenue based on selected time range and compare with previous year
    const selectedYearTotal = totalRevenue;
    const comparisonYear = timeRange === "thisYear" ? currentYear - 1 : currentYear - 2;
    const comparisonYearTotal = data?.filter(d => (d.year || currentYear) === comparisonYear).reduce((sum, d) => sum + d.revenue, 0) || 0;
    
    const growthRate = comparisonYearTotal > 0
      ? Math.round(((selectedYearTotal - comparisonYearTotal) / comparisonYearTotal) * 100)
      : 0;

    return {
      maxRevenue,
      totalRevenue,
      avgRevenue,
      growthRate,
      highestMonth: highestMonthData.month,
      highestMonthRevenue: highestMonthData.revenue,
    };
  }, [chartData, data, currentYear, timeRange]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <TrendingUp size={20} className="text-teal-600" />
        </div>
        <div className="flex items-center gap-2">
          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRangeFilter)}
            className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="thisYear">This Year</option>
            <option value="lastYear">Last Year</option>
          </select>
        </div>
      </div>

      {/* Stats Block - All metrics in one unified section */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-5 mb-6">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Total Revenue</p>
            <p className="text-xl font-bold text-gray-900">
              {isLoading ? (
                <span className="inline-block h-6 w-20 bg-gray-200 rounded animate-pulse" />
              ) : (
                `${currency} ${(stats.totalRevenue / 1000).toFixed(1)}K`
              )}
            </p>
            <p className={`text-sm font-semibold mt-1 ${stats.growthRate >= 0 ? "text-green-600" : "text-red-600"}`}>
              {isLoading ? (
                <span className="inline-block h-4 w-12 bg-gray-200 rounded animate-pulse" />
              ) : (
                `${stats.growthRate >= 0 ? "+" : ""}${stats.growthRate}% vs ${timeRange === "thisYear" ? currentYear - 1 : currentYear - 2}`
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Average Monthly</p>
            <p className="text-xl font-bold text-gray-900">
              {isLoading ? (
                <span className="inline-block h-6 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                `${currency} ${stats.avgRevenue.toLocaleString()}`
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Highest Month</p>
            <p className="text-xl font-bold text-gray-900">
              {isLoading ? (
                <span className="inline-block h-6 w-20 bg-gray-200 rounded animate-pulse" />
              ) : (
                `${currency} ${stats.highestMonthRevenue.toLocaleString()}`
              )}
            </p>
            <p className="text-sm text-gray-600 mt-1">{stats.highestMonth}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-4">
        {/* Chart Container */}
        <div className="relative h-60">
          {/* Y-Axis Grid Lines with Labels */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium min-w-[60px] text-right">
                {isLoading ? (
                  <span className="inline-block h-4 w-12 bg-gray-200 rounded animate-pulse" />
                ) : (
                  `${currency} ${(stats.maxRevenue / 1000).toFixed(1)}K`
                )}
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium min-w-[60px] text-right">
                {isLoading ? (
                  <span className="inline-block h-4 w-12 bg-gray-200 rounded animate-pulse" />
                ) : (
                  `${currency} ${(stats.maxRevenue / 2000).toFixed(1)}K`
                )}
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium min-w-[60px] text-right">0</span>
            </div>
          </div>

          {/* Bars Container */}
          <div className="absolute inset-0 flex items-end justify-between gap-2 px-2 pl-[68px]">
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
                  <div className="w-full relative flex items-end" style={{ height: '192px' }}>
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
                  <p className="text-xs font-medium text-gray-600 mt-3 text-center">
                    {item.month}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
