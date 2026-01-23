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
  const data = useMemo(() => {
    return dashboardData || {
      revenueToday: CHEF_STATS.revenueToday,
      revenueTodayAmount: 2450,
      activeOrders: CHEF_STATS.activeOrders,
      kriScore: CHEF_STATS.kriScore,
      kriScoreAmount: 98,
      kitchenOpen: true,
      monthlyRevenue: CHEF_STATS.monthlyRevenue,
      revenueTrend: 12,
    };
  }, [dashboardData]);

  const displayNotifications = useMemo(() => {
    return notifications.length > 0 ? notifications : CHEF_STATS.notifications;
  }, [notifications]);

  return (
    <div className="p-6 space-y-8">
      {/* Header Section - Always visible, static content */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900">
            Kitchen Dashboard
          </h1>
          <p className="text-gray-500 mt-2">Welcome back, Chef! 👋</p>
        </div>
        {/* Kitchen Status Toggle - Always visible, doesn't need data to load */}
        <KitchenStatusToggle
          initialStatus={kitchenOpen}
          onStatusChange={updateKitchenStatus}
        />
      </div>

      {/* Key Metrics Grid - Show skeleton only if metrics are loading */}
      {loadingMetrics && !dashboardData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="mb-4">
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Today's Revenue */}
          <MemoizedStatCard
            title="Today's Revenue"
            value={data.revenueToday}
            subtitle="Last 24 hours"
            icon={<Banknote size={24} />}
            iconColor="text-green-600"
            trend={{
              value: Math.abs(data.revenueTrend),
              isPositive: data.revenueTrend >= 0,
            }}
          />

          {/* Active Orders */}
          <MemoizedStatCard
            title="Active Orders"
            value={data.activeOrders}
            subtitle="In progress"
            icon={<UtensilsCrossed size={24} />}
            iconColor="text-blue-600"
            badge="On Track"
            badgeColor="bg-blue-100 text-blue-800"
          />

          {/* KRI Score */}
          <MemoizedStatCard
            title="Kitchen Reliability Index"
            value={data.kriScore}
            subtitle="Excellent standing"
            icon={<Trophy size={24} />}
            iconColor="text-yellow-600"
            badge="Top Rated"
            badgeColor="bg-yellow-100 text-yellow-800"
          />
        </div>
      )}

      {/* Error message if metrics failed to load */}
      {error && !dashboardData && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading dashboard data: {error}</p>
        </div>
      )}

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Revenue Chart - Show skeleton only if metrics are loading and no data */}
        <div className="lg:col-span-2">
          {loadingMetrics && !dashboardData ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
                    <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <RevenueChart
              data={data.monthlyRevenue}
              currency="৳"
              title="Monthly Revenue"
            />
          )}
        </div>

        {/* Right Column: Notifications - Show skeleton only if notifications are loading and no data */}
        <div className="lg:col-span-1">
          {loadingNotifications && notifications.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 w-32 bg-gray-100 rounded animate-pulse mb-2" />
                    <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <NotificationFeed notifications={displayNotifications} />
          )}
        </div>
      </div>
    </div>
  );
}
