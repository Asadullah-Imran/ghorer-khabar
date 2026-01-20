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
  loading: boolean; // Overall loading (true only if no cached data exists)
  loadingMetrics: boolean; // Metrics-specific loading
  loadingNotifications: boolean; // Notifications-specific loading
  error: string | null;
  kitchenOpen: boolean | null;
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
  const [loadingMetrics, setLoadingMetrics] = useState(!dashboardCache);
  const [loadingNotifications, setLoadingNotifications] = useState(!notificationsCache);
  const [error, setError] = useState<string | null>(null);
  const [kitchenOpen, setKitchenOpen] = useState<boolean | null>(dashboardCache?.kitchenOpen ?? null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const fetchDashboardData = useCallback(async () => {
    // Use cache if still valid
    const now = Date.now();
    const useCache = dashboardCache && now - cacheTimestamp < CACHE_DURATION;
    
    if (useCache) {
      setDashboardData(dashboardCache);
      setNotifications(notificationsCache);
      setKitchenOpen(dashboardCache.kitchenOpen);
      setLoading(false);
      setLoadingMetrics(false);
      setLoadingNotifications(false);
      return;
    }

    try {
      setError(null);
      
      // Check if we have cached data BEFORE fetching to determine loading states
      const hasCachedMetrics = !!dashboardCache;
      const hasCachedNotifications = notificationsCache.length > 0;
      
      // Set initial loading states only if we don't have cached data
      if (!hasCachedMetrics) {
        setLoading(true);
        setLoadingMetrics(true);
      }
      if (!hasCachedNotifications) {
        setLoadingNotifications(true);
      }

      // Fetch metrics and notifications in parallel, but update UI as each completes
      const metricsPromise = fetch("/api/chef/dashboard/metrics", { credentials: "include" })
        .then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch dashboard metrics");
          }
          return response.json();
        })
        .then((metricsData) => {
          if (metricsData.success && metricsData.data) {
            // Update cache
            dashboardCache = metricsData.data;
            cacheTimestamp = now;
            if (isMountedRef.current) {
              setDashboardData(metricsData.data);
              setKitchenOpen(metricsData.data.kitchenOpen);
            }
          } else {
            throw new Error("Invalid metrics response format");
          }
        })
        .catch((err) => {
          console.error("Error fetching metrics:", err);
          throw err;
        })
        .finally(() => {
          if (isMountedRef.current) {
            setLoadingMetrics(false);
            setLoading(false); // Metrics are the main data, so we can show UI once they load
          }
        });

      const notificationsPromise = fetch("/api/chef/dashboard/notifications?limit=10", { credentials: "include" })
        .then(async (response) => {
          if (response.ok) {
            const notificationsData = await response.json();
            if (notificationsData.success && notificationsData.data) {
              notificationsCache = notificationsData.data;
              if (isMountedRef.current) {
                setNotifications(notificationsData.data);
              }
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching notifications:", err);
          // Don't throw - notifications are not critical
        })
        .finally(() => {
          if (isMountedRef.current) {
            setLoadingNotifications(false);
          }
        });

      // Wait for both, but UI updates as each completes
      await Promise.allSettled([metricsPromise, notificationsPromise]);
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      if (isMountedRef.current) {
        setLoading(false);
        setLoadingMetrics(false);
        setLoadingNotifications(false);
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
    loadingMetrics,
    loadingNotifications,
    error,
    kitchenOpen,
    refetch: fetchDashboardData,
    updateKitchenStatus,
  };
}
