"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type OrderStatus = "new" | "cooking" | "ready" | "handover";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalPrice: number;
  specialNotes?: string;
  createdAt: Date;
  prepTime: number;
  userId: string;
}

interface KanbanOrders {
  new: Order[];
  cooking: Order[];
  ready: Order[];
  handover: Order[];
}

interface UseChefOrdersRealtimeReturn {
  orders: KanbanOrders;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  moveOrder: (orderId: string, newStatus: string) => Promise<void>;
  rejectOrder: (orderId: string) => Promise<void>;
}

export function useChefOrdersRealtime(): UseChefOrdersRealtimeReturn {
  const [orders, setOrders] = useState<KanbanOrders>({
    new: [],
    cooking: [],
    ready: [],
    handover: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isMountedRef = useRef(true);

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/chef/orders/kanban", {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch orders");
      }

      const data = await response.json();
      if (data.success && data.data) {
        const transformedData = {
          new: data.data.new.map((o: any) => ({
            ...o,
            createdAt: new Date(o.createdAt),
          })),
          cooking: data.data.cooking.map((o: any) => ({
            ...o,
            createdAt: new Date(o.createdAt),
          })),
          ready: data.data.ready.map((o: any) => ({
            ...o,
            createdAt: new Date(o.createdAt),
          })),
          handover: data.data.handover.map((o: any) => ({
            ...o,
            createdAt: new Date(o.createdAt),
          })),
        };
        if (isMountedRef.current) {
          setOrders(transformedData);
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial fetch
    fetchOrders();

    // Set up Supabase Realtime subscription for orders
    // Fetch kitchen ID first
    const setupRealtime = async () => {
      if (!user?.id) return;

      try {
        // Get kitchen ID from API
        const kitchenRes = await fetch("/api/chef/onboarding", { credentials: "include" });
        if (kitchenRes.ok) {
          const kitchenData = await kitchenRes.json();
          const kitchenId = kitchenData.data?.kitchen?.id;

          if (kitchenId) {
            const channel = supabase
              .channel(`chef-orders-${kitchenId}`)
              .on(
                "postgres_changes",
                {
                  event: "*", // Listen to INSERT, UPDATE, DELETE
                  schema: "public",
                  table: "orders",
                  filter: `kitchen_id=eq.${kitchenId}`,
                },
                (payload) => {
                  console.log("Order realtime update:", payload.eventType, payload.new);
                  // Refetch orders when changes occur
                  if (isMountedRef.current) {
                    fetchOrders();
                  }
                }
              )
              .subscribe((status) => {
                console.log("Realtime subscription status:", status);
              });

            channelRef.current = channel;
          }
        }
      } catch (err) {
        console.error("Error setting up realtime:", err);
      }
    };

    setupRealtime();

    // Fallback polling (only when tab is visible)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchOrders();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Poll every 30 seconds only when visible (backup to realtime)
    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && isMountedRef.current) {
        fetchOrders();
      }
    }, 30000);

    return () => {
      isMountedRef.current = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user?.id, fetchOrders, supabase]);

  const moveOrder = useCallback(async (orderId: string, newStatus: string) => {
    try {
      const currentOrder = [
        ...orders.new,
        ...orders.cooking,
        ...orders.ready,
        ...orders.handover,
      ].find((o) => o.id === orderId);

      if (!currentOrder || currentOrder.status === "handover") {
        return;
      }

      let backendStatus: string;
      if (currentOrder.status === "new" && newStatus === "cooking") {
        backendStatus = "CONFIRMED";
      } else if (currentOrder.status === "cooking" && newStatus === "ready") {
        backendStatus = "DELIVERING";
      } else if (currentOrder.status === "ready" && newStatus === "handover") {
        backendStatus = "COMPLETED";
      } else {
        console.error("Invalid status transition", { from: currentOrder.status, to: newStatus });
        return;
      }

      const response = await fetch(`/api/chef/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: backendStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update order");
      }

      // Realtime will handle the update, but we can optimistically update
      await fetchOrders();
    } catch (err) {
      console.error("Error updating order:", err);
      throw err;
    }
  }, [orders, fetchOrders]);

  const rejectOrder = useCallback(async (orderId: string) => {
    try {
      const response = await fetch(`/api/chef/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reject order");
      }

      await fetchOrders();
    } catch (err) {
      console.error("Error rejecting order:", err);
      throw err;
    }
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    moveOrder,
    rejectOrder,
  };
}
