"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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

interface UseChefDashboardReturn {
  dashboardData: DashboardData | null;
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  kitchenOpen: boolean;
  refetch: () => Promise<void>;
  updateKitchenStatus: (status: boolean) => Promise<void>;
}

// Cache for dashboard data
let dashboardCache: DashboardData | null = null;
let notificationsCache: Notification[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 10000; // 10 seconds

export function useChefDashboard(): UseChefDashboardReturn {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(dashboardCache);
  const [notifications, setNotifications] = useState<Notification[]>(notificationsCache);
  const [loading, setLoading] = useState(!dashboardCache);
  const [error, setError] = useState<string | null>(null);
  const [kitchenOpen, setKitchenOpen] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const fetchDashboardData = useCallback(async () => {
    // Use cache if still valid
    const now = Date.now();
    if (dashboardCache && now - cacheTimestamp < CACHE_DURATION) {
      setDashboardData(dashboardCache);
      setNotifications(notificationsCache);
      setLoading(false);
      return;
    }

    try {
      setError(null);

      // Fetch metrics and notifications in parallel
      const [metricsResponse, notificationsResponse] = await Promise.all([
        fetch("/api/chef/dashboard/metrics", { credentials: "include" }),
        fetch("/api/chef/dashboard/notifications?limit=10", { credentials: "include" }),
      ]);

      if (!metricsResponse.ok) {
        const errorData = await metricsResponse.json();
        throw new Error(errorData.error || "Failed to fetch dashboard metrics");
      }

      const metricsData = await metricsResponse.json();
      
      if (metricsData.success && metricsData.data) {
        // Update cache
        dashboardCache = metricsData.data;
        cacheTimestamp = now;
        setDashboardData(metricsData.data);
        setKitchenOpen(metricsData.data.kitchenOpen);
      } else {
        throw new Error("Invalid metrics response format");
      }

      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        if (notificationsData.success && notificationsData.data) {
          notificationsCache = notificationsData.data;
          setNotifications(notificationsData.data);
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const updateKitchenStatus = useCallback(async (status: boolean) => {
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
            const updated = { ...dashboardData, kitchenOpen: status };
            dashboardCache = updated;
            setDashboardData(updated);
          }
          // Invalidate cache to force refresh
          cacheTimestamp = 0;
        }
      } else {
        const errorData = await response.json();
        console.error("Error updating kitchen status:", errorData);
      }
    } catch (err) {
      console.error("Error updating kitchen status:", err);
    }
  }, [dashboardData]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchDashboardData();

    // Only poll if tab is visible (performance optimization)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchDashboardData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Refresh every 30 seconds only when visible
    intervalRef.current = setInterval(() => {
      if (document.visibilityState === "visible" && isMountedRef.current) {
        fetchDashboardData();
      }
    }, 30000);

    return () => {
      isMountedRef.current = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchDashboardData]);

  return {
    dashboardData,
    notifications,
    loading,
    error,
    kitchenOpen,
    refetch: fetchDashboardData,
    updateKitchenStatus,
  };
}
