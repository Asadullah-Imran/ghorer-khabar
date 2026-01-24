"use client";

import StatCard from "@/components/chef/StatCard";
import RevenueChart from "@/components/chef/RevenueChart";
import NotificationFeed from "@/components/chef/NotificationFeed";
import KitchenStatusToggle from "@/components/chef/KitchenStatusToggle";
import { Banknote, Trophy, UtensilsCrossed } from "lucide-react";
import { useChefDashboard } from "@/lib/hooks/useChefDashboard";
import { CHEF_STATS } from "@/lib/dummy-data/chef";
import { useMemo, memo } from "react";

// Memoized StatCard wrapper to prevent unnecessary re-renders
const MemoizedStatCard = memo(StatCard);

export default function ChefDashboard() {
  const {
    dashboardData,
    notifications,
    loading,
    loadingMetrics,
    loadingNotifications,
    error,
    kitchenOpen,
    updateKitchenStatus,
  } = useChefDashboard();

  // Memoize data to prevent recalculation
  // Use empty structure for monthlyRevenue when loading so chart structure renders immediately
  const data = useMemo(() => {
    if (!dashboardData) {
      // Return structure with empty monthly revenue so chart renders immediately
      return {
        revenueToday: "৳ 0",
        revenueTodayAmount: 0,
        activeOrders: 0,
        kriScore: "0/100",
        kriScoreAmount: 0,
        kitchenOpen: true,
        monthlyRevenue: [], // Empty array - chart will use static structure
        revenueTrend: 0,
      };
    }
    return dashboardData;
  }, [dashboardData]);

  const displayNotifications = useMemo(() => {
    return notifications;
  }, [notifications]);

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header Section - Always visible, static content */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900">
            Kitchen Dashboard
          </h1>
          <p className="text-gray-500 mt-2">Welcome back, Chef! 👋</p>
        </div>
        {/* Kitchen Status Toggle - hide while status is loading to avoid flicker */}
        {kitchenOpen !== null && (
          <KitchenStatusToggle
            initialStatus={kitchenOpen}
            onStatusChange={updateKitchenStatus}
          />
        )}
      </div>

      {/* Key Metrics Grid - Always show cards, use skeleton only if no data at all */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Revenue */}
        <MemoizedStatCard
          title="Today's Revenue"
          value={loadingMetrics && !dashboardData ? "Loading..." : data.revenueToday}
          subtitle="Last 24 hours"
          icon={<Banknote size={24} />}
          iconColor="text-green-600"
          trend={
            loadingMetrics && !dashboardData
              ? undefined
              : {
                  value: Math.abs(data.revenueTrend),
                  isPositive: data.revenueTrend >= 0,
                }
          }
        />

        {/* Active Orders */}
        <MemoizedStatCard
          title="Active Orders"
          value={loadingMetrics && !dashboardData ? "..." : data.activeOrders}
          subtitle="In progress"
          icon={<UtensilsCrossed size={24} />}
          iconColor="text-blue-600"
          badge={loadingMetrics && !dashboardData ? undefined : "On Track"}
          badgeColor="bg-blue-100 text-blue-800"
        />

        {/* KRI Score */}
        <MemoizedStatCard
          title="Kitchen Reliability Index"
          value={loadingMetrics && !dashboardData ? "..." : data.kriScore}
          subtitle="Excellent standing"
          icon={<Trophy size={24} />}
          iconColor="text-yellow-600"
          badge={loadingMetrics && !dashboardData ? undefined : "Top Rated"}
          badgeColor="bg-yellow-100 text-yellow-800"
        />
      </div>

      {/* Error message if metrics failed to load */}
      {error && !dashboardData && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading dashboard data: {error}</p>
        </div>
      )}

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Revenue Chart - Always show, chart handles loading internally */}
        <div className="lg:col-span-2">
          <RevenueChart
            data={data.monthlyRevenue}
            currency="৳"
            title="Monthly Revenue"
            isLoading={loadingMetrics && !dashboardData}
          />
        </div>

        {/* Right Column: Notifications - Always show, component handles loading */}
        <div className="lg:col-span-1">
          <NotificationFeed 
            notifications={displayNotifications}
            isLoading={loadingNotifications && notifications.length === 0}
          />
        </div>
      </div>
    </div>
  );
}
