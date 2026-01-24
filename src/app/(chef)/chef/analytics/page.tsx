"use client";

import { AlertTriangle, Brain, DollarSign, Lightbulb, MessageSquare, RefreshCw, ShoppingBag, Sparkles, Star, ThumbsUp } from "lucide-react";
import React, { memo, useCallback, useState } from "react";

// Types for AI insights
interface PositiveTheme {
  theme: string;
  count: number;
  keywords: string[];
}

interface ImprovementArea {
  issue: string;
  count: number;
  sample_review: string;
  suggestion: string;
  affected_dishes: string[];
}

interface ReviewInsights {
  summary: {
    total_reviews: number;
    positive_count: number;
    negative_count: number;
    neutral_count: number;
    avg_rating: number;
  };
  positive_themes: PositiveTheme[];
  improvement_areas: ImprovementArea[];
}

interface KitchenInsight {
  type: string;
  priority: string;
  title: string;
  description: string;
  metric: Record<string, any>;
}

// Memoized KPI Card Component
const KPICard = memo(({ icon: Icon, label, value, growth, color, isLoading }: {
  icon: any;
  label: string;
  value: string;
  growth?: number;
  color: string;
  isLoading?: boolean;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
    <p className="text-xs text-gray-600 mb-3">{label}</p>
    <div className="flex items-center gap-3">
      <div className={`p-2 ${color} rounded-lg flex-shrink-0`}>
        <Icon className={color.replace('bg-', 'text-').replace('100', '600')} size={20} />
      </div>
      <div className="flex-1 min-w-0">
        {isLoading ? (
          <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <p className="text-2xl font-black text-gray-900 truncate">{value}</p>
        )}
      </div>
    </div>
  </div>
));

KPICard.displayName = 'KPICard';

// Memoized Top Dish Item - Structure always visible
const TopDishItem = memo(({ dish, index }: { dish: any; index: number }) => {
  const name = dish?.name || "Loading...";
  const sales = dish?.sales || 0;
  const percentage = dish?.percentage || 0;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-yellow-500">#{index + 1}</span>
          <span className="font-semibold text-gray-900">
            {name === "Loading..." ? (
              <span className="inline-block h-4 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
              name
            )}
          </span>
        </div>
        <span className="text-sm font-bold text-gray-600">
          {sales > 0 ? `${sales} sold` : "—"}
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percentage > 0 
              ? "bg-gradient-to-r from-yellow-400 to-yellow-500" 
              : "bg-gray-100"
          }`}
          style={{ width: `${Math.max(percentage, 0)}%` }}
        ></div>
      </div>
    </div>
  );
});

TopDishItem.displayName = 'TopDishItem';

// Memoized Chart Component - Static structure, dynamic values
const RevenueChart = memo(({ data, isLoading }: { data: any; isLoading?: boolean }) => {
  // Static week structure - always render
  const weeks = data?.weeks || ["Week 1", "Week 2", "Week 3", "Week 4"];
  const revenue = data?.revenue || [0, 0, 0, 0];
  const profit = data?.profit || [0, 0, 0, 0];
  
  // Calculate max for scaling based on actual data
  const maxValue = Math.max(...revenue, ...profit, 1); // Use actual max, minimum 1 to avoid division by zero

  return (
    <div className="relative h-64">
      {/* Y-axis labels - Static structure, dynamic values */}
      <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500 pr-2">
        {isLoading ? (
          <>
            <span className="inline-block h-3 w-10 bg-gray-200 rounded animate-pulse" />
            <span className="inline-block h-3 w-10 bg-gray-200 rounded animate-pulse" />
            <span className="inline-block h-3 w-10 bg-gray-200 rounded animate-pulse" />
            <span className="inline-block h-3 w-10 bg-gray-200 rounded animate-pulse" />
            <span className="inline-block h-3 w-10 bg-gray-200 rounded animate-pulse" />
            <span>৳0</span>
          </>
        ) : (
          <>
            <span>৳{(maxValue / 1000).toFixed(0)}K</span>
            <span>৳{(maxValue / 1.25 / 1000).toFixed(0)}K</span>
            <span>৳{(maxValue / 2 / 1000).toFixed(0)}K</span>
            <span>৳{(maxValue / 4 / 1000).toFixed(0)}K</span>
            <span>৳{(maxValue / 5 / 1000).toFixed(0)}K</span>
            <span>৳0</span>
          </>
        )}
      </div>

      {/* Chart Area - Static structure, dynamic bar heights */}
      <div className="ml-12 h-full flex items-end justify-between gap-4 border-l-2 border-b-2 border-gray-300 pl-4 pb-8">
        {weeks.map((week: string, index: number) => {
          const revenueHeight = maxValue > 0 ? (revenue[index] / maxValue) * 100 : 0;
          const profitHeight = maxValue > 0 ? (profit[index] / maxValue) * 100 : 0;
          const isZero = revenue[index] === 0 && profit[index] === 0;

          return (
            <div key={week} className="flex-1 relative h-full flex flex-col justify-end">
              {/* Revenue Bar - Always rendered */}
              {isLoading && isZero ? (
                <div className="w-full h-2 bg-gray-200 rounded-t animate-pulse" />
              ) : (
                <div
                  className={`w-full rounded-t relative group transition ${
                    isZero 
                      ? "bg-gray-100" 
                      : "bg-yellow-400 hover:bg-yellow-500 cursor-pointer"
                  }`}
                  style={{ height: `${Math.max(revenueHeight, 2)}%` }}
                >
                  {!isZero && revenue[index] > 0 && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                      ৳{(revenue[index] / 1000).toFixed(0)}K
                    </div>
                  )}
                </div>
              )}
              {/* Profit Bar Overlay - Always rendered */}
              {!isLoading && (
                <div
                  className={`w-full rounded-t absolute bottom-0 left-0 group transition ${
                    isZero 
                      ? "bg-gray-100" 
                      : "bg-teal-700 hover:bg-teal-800 cursor-pointer"
                  }`}
                  style={{ height: `${Math.max(profitHeight, 2)}%` }}
                >
                  {!isZero && profit[index] > 0 && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                      ৳{(profit[index] / 1000).toFixed(0)}K
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* X-axis labels - Static, always visible */}
      <div className="ml-12 mt-2 flex justify-between text-xs text-gray-600 font-semibold">
        {weeks.map((week: string) => (
          <span key={week} className="flex-1 text-center">{week}</span>
        ))}
      </div>
    </div>
  );
});

RevenueChart.displayName = 'RevenueChart';

export default function AnalyticsPage() {
  const [kpisLoading, setKpisLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [dishesLoading, setDishesLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // State for actual data from API - start with empty structures for instant rendering
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgRating: 0,
  });
  const [chartData, setChartData] = useState({
    weeks: ["Week 1", "Week 2", "Week 3", "Week 4"],
    revenue: [0, 0, 0, 0],
    profit: [0, 0, 0, 0],
  });
  const [topDishes, setTopDishes] = useState<any[]>([]);
  const [reviewInsights, setReviewInsights] = useState<ReviewInsights>({
    summary: { total_reviews: 0, positive_count: 0, negative_count: 0, neutral_count: 0, avg_rating: 0 },
    positive_themes: [],
    improvement_areas: []
  });
  const [kitchenInsights, setKitchenInsights] = useState<KitchenInsight[]>([]);
  const [additionalStats, setAdditionalStats] = useState({
    customerRetention: 0,
    avgOrderValue: 0,
    fulfillmentRate: 0,
  });

  // Fetch all analytics data on component mount
  React.useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        // Load all data in parallel
        const [kpiRes, chartRes, dishesRes, insightsRes] = await Promise.all([
          fetch('/api/chef/analytics/kpis?days=30'),
          fetch('/api/chef/analytics/chart?days=30'),
          fetch('/api/chef/analytics/dishes?days=30'),
          fetch('/api/chef/analytics/ai-insights?days=30'),
        ]);

        // Process KPIs
        if (kpiRes.ok) {
          const kpiData = await kpiRes.json();
          setKpiData(kpiData);
          // Load additional stats from KPIs response
          if (kpiData.additionalStats) {
            setAdditionalStats(kpiData.additionalStats);
          }
        }
        setKpisLoading(false);

        // Process Chart
        if (chartRes.ok) {
          const chartData = await chartRes.json();
          setChartData(chartData);
        }
        setChartLoading(false);

        // Process Dishes
        if (dishesRes.ok) {
          const dishesData = await dishesRes.json();
          setTopDishes(dishesData);
        }
        setDishesLoading(false);

        // Process AI Insights from ML service
        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          if (insightsData.review_insights) {
            setReviewInsights(insightsData.review_insights);
          }
          if (insightsData.kitchen_insights) {
            setKitchenInsights(insightsData.kitchen_insights);
          }
        }
        setInsightsLoading(false);

        setIsInitialLoad(false);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
        setKpisLoading(false);
        setChartLoading(false);
        setDishesLoading(false);
        setInsightsLoading(false);
        setIsInitialLoad(false);
      }
    };

    loadAnalyticsData();
  }, []);

  // Refresh individual sections without full page reload
  const refreshKPIs = useCallback(async () => {
    setKpisLoading(true);
    try {
      const response = await fetch('/api/chef/analytics/kpis?days=30');
      if (response.ok) {
        const data = await response.json();
        setKpiData(data);
        if (data.additionalStats) {
          setAdditionalStats(data.additionalStats);
        }
      }
    } catch (error) {
      console.error('Failed to refresh KPIs:', error);
    } finally {
      setKpisLoading(false);
    }
  }, []);

  const refreshChart = useCallback(async () => {
    setChartLoading(true);
    try {
      const response = await fetch('/api/chef/analytics/chart?days=30');
      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      }
    } catch (error) {
      console.error('Failed to refresh chart:', error);
    } finally {
      setChartLoading(false);
    }
  }, []);

  const refreshDishes = useCallback(async () => {
    setDishesLoading(true);
    try {
      const response = await fetch('/api/chef/analytics/dishes?days=30');
      if (response.ok) {
        const data = await response.json();
        setTopDishes(data);
      }
    } catch (error) {
      console.error('Failed to refresh dishes:', error);
    } finally {
      setDishesLoading(false);
    }
  }, []);

  const refreshInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const response = await fetch('/api/chef/analytics/ai-insights?days=30');
      if (response.ok) {
        const data = await response.json();
        if (data.review_insights) {
          setReviewInsights(data.review_insights);
        }
        if (data.kitchen_insights) {
          setKitchenInsights(data.kitchen_insights);
        }
      }
    } catch (error) {
      console.error('Failed to refresh insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-500 mt-2">Track your growth and AI-driven recommendations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              refreshKPIs();
              refreshChart();
              refreshDishes();
              refreshInsights();
            }}
            className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 rounded-lg transition flex items-center gap-2 font-semibold text-gray-900"
          >
            <RefreshCw size={18} />
            Refresh All
          </button>
        </div>
      </div>

      {/* KPI Overview - All 6 Cards */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Key Performance Indicators</h2>
          <button
            onClick={refreshKPIs}
            disabled={kpisLoading}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={14} className={kpisLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={DollarSign}
            label="Total Revenue"
            value={kpisLoading ? "..." : `৳${kpiData.totalRevenue.toLocaleString()}`}
            color="bg-yellow-100"
            isLoading={kpisLoading && kpiData.totalRevenue === 0}
          />
          <KPICard
            icon={ShoppingBag}
            label="Total Orders"
            value={kpisLoading ? "..." : kpiData.totalOrders.toString()}
            color="bg-blue-100"
            isLoading={kpisLoading && kpiData.totalOrders === 0}
          />
          <KPICard
            icon={Star}
            label="Avg. Rating"
            value={kpisLoading ? "..." : `${kpiData.avgRating}`}
            color="bg-orange-100"
            isLoading={kpisLoading && kpiData.avgRating === 0}
          />
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs text-gray-600 mb-3">Avg. Order Value</p>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                <ShoppingBag className="text-yellow-600" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                {kpisLoading ? (
                  <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-2xl font-black text-gray-900 truncate">৳{additionalStats.avgOrderValue}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts - Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Profit Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Revenue vs. Profit</h2>
            <button
              onClick={refreshChart}
              disabled={chartLoading}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={chartLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          
          {/* Chart Legend */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-sm text-gray-600">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-teal-700 rounded"></div>
              <span className="text-sm text-gray-600">Profit</span>
            </div>
          </div>

          <RevenueChart data={chartData} isLoading={chartLoading} />
        </div>

        {/* Top Selling Dishes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Top Selling Dishes</h2>
            <button
              onClick={refreshDishes}
              disabled={dishesLoading}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={dishesLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          
          {/* Always show structure - render empty state or data */}
          <div className="space-y-5">
            {dishesLoading && topDishes.length === 0 ? (
              // Show skeleton only if no data at all
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-gray-200 animate-pulse rounded"></div>
              ))
            ) : topDishes.length > 0 ? (
              // Show actual dishes
              topDishes.map((dish, index) => (
                <TopDishItem key={dish.name || `dish-${index}`} dish={dish} index={index} />
              ))
            ) : (
              // Empty state - structure visible but no data
              <div className="text-center py-8">
                <p className="text-gray-500">No dish data available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Kitchen Intelligence - Bottom Row */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="text-purple-600" size={28} />
            <h2 className="text-2xl font-bold text-gray-900">AI Kitchen Intelligence</h2>
            <Sparkles className="text-purple-500" size={20} />
          </div>
          <button
            onClick={refreshInsights}
            disabled={insightsLoading}
            className="px-3 py-1.5 text-sm bg-white hover:bg-gray-50 border border-purple-200 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={14} className={insightsLoading ? 'animate-spin' : ''} />
            Refresh AI
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Review Sentiment Analysis */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">What Customers Are Saying</h3>
              {reviewInsights.summary.total_reviews > 0 && (
                <span className="text-sm text-gray-500">
                  {reviewInsights.summary.total_reviews} reviews
                </span>
              )}
            </div>
            
            {insightsLoading ? (
              <div className="space-y-4">
                <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Positive Themes */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsUp className="text-green-600" size={18} />
                    <span className="font-semibold text-green-700">
                      Positive Feedback ({reviewInsights.summary.positive_count})
                    </span>
                  </div>
                  {reviewInsights.positive_themes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {reviewInsights.positive_themes.map((theme) => (
                        <span
                          key={theme.theme}
                          className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full"
                          title={`${theme.count} mentions`}
                        >
                          {theme.theme}
                          <span className="ml-1 text-green-600 text-xs">({theme.count})</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No positive feedback themes detected yet.</p>
                  )}
                </div>

                {/* Improvement Areas with Suggestions */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="text-amber-600" size={18} />
                    <span className="font-semibold text-amber-700">
                      Areas for Improvement ({reviewInsights.summary.negative_count})
                    </span>
                  </div>
                  {reviewInsights.improvement_areas.length > 0 ? (
                    <div className="space-y-3">
                      {reviewInsights.improvement_areas.map((area) => (
                        <div 
                          key={area.issue}
                          className="p-3 bg-amber-50 border border-amber-200 rounded-lg"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-amber-800 text-sm">
                              {area.issue}
                            </span>
                            <span className="text-xs text-amber-600">
                              ({area.count} {area.count === 1 ? 'mention' : 'mentions'})
                            </span>
                          </div>
                          {area.sample_review && (
                            <div className="flex items-start gap-2 mb-2">
                              <MessageSquare className="text-gray-400 mt-0.5" size={14} />
                              <p className="text-xs text-gray-600 italic">
                                "{area.sample_review}..."
                              </p>
                            </div>
                          )}
                          <div className="flex items-start gap-2">
                            <Lightbulb className="text-amber-500 mt-0.5 flex-shrink-0" size={14} />
                            <p className="text-xs text-amber-700 font-medium">
                              {area.suggestion}
                            </p>
                          </div>
                          {area.affected_dishes.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Affected: {area.affected_dishes.join(", ")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No major issues detected. Great job!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Kitchen Insights */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Kitchen Insights</h3>
            
            {insightsLoading ? (
              <div className="space-y-4">
                <div className="h-24 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-24 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ) : kitchenInsights.length > 0 ? (
              <div className="space-y-4">
                {kitchenInsights.map((insight, index) => (
                  <div
                    key={`${insight.type}-${index}`}
                    className={`p-4 rounded-lg border-l-4 ${
                      insight.priority === "high"
                        ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-400"
                        : insight.priority === "medium"
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-400"
                        : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-400"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-gray-900">{insight.title}</h4>
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded ${
                          insight.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : insight.priority === "medium"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {insight.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{insight.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500">
                  Start receiving orders to see AI-powered insights here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
