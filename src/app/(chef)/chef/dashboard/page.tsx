"use client";

import StatCard from "@/components/chef/StatCard";
import RevenueChart from "@/components/chef/RevenueChart";
import NotificationFeed from "@/components/chef/NotificationFeed";
import KitchenStatusToggle from "@/components/chef/KitchenStatusToggle";
import { Banknote, Trophy, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { CHEF_STATS } from "@/lib/dummy-data/chef";

interface DashboardData {
  revenueToday: string;
  revenueTodayAmount: number;
  activeOrders: number;
  kriScore: string;
  kriScoreAmount: number;
  kitchenOpen: boolean;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  revenueTrend: number;
}

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export default function ChefDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kitchenOpen, setKitchenOpen] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch metrics
        const metricsResponse = await fetch("/api/chef/dashboard/metrics", {
          credentials: "include",
        });
        console.log("Metrics response status:", metricsResponse.status);
        
        if (!metricsResponse.ok) {
          const errorData = await metricsResponse.json();
          console.error("Metrics error:", errorData);
          throw new Error(errorData.error || "Failed to fetch dashboard metrics");
        }
        const metricsData = await metricsResponse.json();
        console.log("Metrics data received:", metricsData);
        
        if (metricsData.success && metricsData.data) {
          setDashboardData(metricsData.data);
          setKitchenOpen(metricsData.data.kitchenOpen);
        } else {
          throw new Error("Invalid metrics response format");
        }

        // Fetch notifications
        const notificationsResponse = await fetch(
          "/api/chef/dashboard/notifications?limit=10",
          { credentials: "include" }
        );
        console.log("Notifications response status:", notificationsResponse.status);
        
        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json();
          console.log("Notifications data received:", notificationsData);
          
          if (notificationsData.success && notificationsData.data) {
            setNotifications(notificationsData.data);
          }
        } else {
          const errorData = await notificationsResponse.json();
          console.error("Notifications error:", errorData);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        // Fallback to dummy data
        setDashboardData({
          revenueToday: CHEF_STATS.revenueToday,
          revenueTodayAmount: 2450,
          activeOrders: CHEF_STATS.activeOrders,
          kriScore: CHEF_STATS.kriScore,
          kriScoreAmount: 98,
          kitchenOpen: true,
          monthlyRevenue: CHEF_STATS.monthlyRevenue,
          revenueTrend: 12,
        });
        setNotifications(CHEF_STATS.notifications);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (status: boolean) => {
    try {
      const response = await fetch("/api/chef/dashboard/metrics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isOpen: status }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setKitchenOpen(status);
          if (dashboardData) {
            setDashboardData({ ...dashboardData, kitchenOpen: status });
          }
        }
      } else {
        const errorData = await response.json();
        console.error("Error updating kitchen status:", errorData);
      }
    } catch (err) {
      console.error("Error updating kitchen status:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-4" />
            <div className="h-5 w-48 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-12 w-48 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* Stat Cards Skeleton */}
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

        {/* Charts and Notifications Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Skeleton */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
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

          {/* Notifications Skeleton */}
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
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="p-6 space-y-8">
        <div className="text-center py-12">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  const data = dashboardData || {
    revenueToday: CHEF_STATS.revenueToday,
    revenueTodayAmount: 2450,
    activeOrders: CHEF_STATS.activeOrders,
    kriScore: CHEF_STATS.kriScore,
    kriScoreAmount: 98,
    kitchenOpen: true,
    monthlyRevenue: CHEF_STATS.monthlyRevenue,
    revenueTrend: 12,
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900">
            Kitchen Dashboard
          </h1>
          <p className="text-gray-500 mt-2">Welcome back, Chef! 👋</p>
        </div>
        <KitchenStatusToggle
          initialStatus={kitchenOpen}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Revenue */}
        <StatCard
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
        <StatCard
          title="Active Orders"
          value={data.activeOrders}
          subtitle="In progress"
          icon={<UtensilsCrossed size={24} />}
          iconColor="text-blue-600"
          badge="On Track"
          badgeColor="bg-blue-100 text-blue-800"
        />

        {/* KRI Score */}
        <StatCard
          title="Kitchen Reliability Index"
          value={data.kriScore}
          subtitle="Excellent standing"
          icon={<Trophy size={24} />}
          iconColor="text-yellow-600"
          badge="Top Rated"
          badgeColor="bg-yellow-100 text-yellow-800"
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Revenue Chart */}
        <div className="lg:col-span-2">
          <RevenueChart
            data={data.monthlyRevenue}
            currency="৳"
            title="Monthly Revenue"
          />
        </div>

        {/* Right Column: Notifications */}
        <div className="lg:col-span-1">
          <NotificationFeed
            notifications={notifications.length > 0 ? notifications : CHEF_STATS.notifications}
          />
        </div>
      </div>
    </div>
  );
}
