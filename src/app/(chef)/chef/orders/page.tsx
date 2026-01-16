"use client";

import KanbanColumn from "@/components/chef/Kanban/KanbanColumn";
import {
  CheckCircle,
  Clock,
  PackageCheck,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<KanbanOrders>({
    new: [],
    cooking: [],
    ready: [],
    handover: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
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
        // Convert createdAt strings to Date objects
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
        setOrders(transformedData);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Refresh orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMoveOrder = async (orderId: string, newStatus: string) => {
    try {
      const currentOrder = [
        ...orders.new,
        ...orders.cooking,
        ...orders.ready,
        ...orders.handover,
      ].find((o) => o.id === orderId);

      if (!currentOrder) return;

      // Map frontend status transitions to backend status
      // Flow: PENDING -> CONFIRMED -> PREPARING -> DELIVERING -> COMPLETED
      // Frontend: new -> cooking -> ready -> handover
      let backendStatus: string;
      
      if (currentOrder.status === "new" && newStatus === "cooking") {
        // Accept order: PENDING -> CONFIRMED
        backendStatus = "CONFIRMED";
      } else if (currentOrder.status === "cooking" && newStatus === "ready") {
        // Mark ready: CONFIRMED/PREPARING -> DELIVERING
        // API allows CONFIRMED -> DELIVERING (skipping PREPARING if needed)
        backendStatus = "DELIVERING";
      } else if (currentOrder.status === "ready" && newStatus === "handover") {
        // Handover: DELIVERING -> COMPLETED
        backendStatus = "COMPLETED";
      } else {
        console.error("Invalid status transition", { from: currentOrder.status, to: newStatus });
        alert("Invalid status transition");
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

      // Refresh orders after successful update
      await fetchOrders();
    } catch (err) {
      console.error("Error updating order:", err);
      alert(err instanceof Error ? err.message : "Failed to update order");
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Live Orders</h1>
          <p className="text-gray-500 mt-2">Loading orders...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-lg p-4 min-h-[500px] border border-gray-200"
            >
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2].map((j) => (
                  <div
                    key={j}
                    className="bg-white border border-gray-200 rounded-lg p-4 h-32 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Live Orders</h1>
          <p className="text-red-500 mt-2">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-gray-900">Live Orders</h1>
        <p className="text-gray-500 mt-2">
          Manage your kitchen workflow - {Object.values(orders).flat().length} orders
        </p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* New Orders */}
        <KanbanColumn
          title="New Requests"
          orders={orders.new}
          color="border-blue-500"
          icon={<Zap size={20} className="text-blue-600" />}
          onMove={handleMoveOrder}
        />

        {/* Cooking */}
        <KanbanColumn
          title="Cooking"
          orders={orders.cooking}
          color="border-orange-500"
          icon={<Clock size={20} className="text-orange-600" />}
          onMove={handleMoveOrder}
        />

        {/* Ready */}
        <KanbanColumn
          title="Ready for Pickup"
          orders={orders.ready}
          color="border-green-500"
          icon={<PackageCheck size={20} className="text-green-600" />}
          onMove={handleMoveOrder}
        />

        {/* Handover */}
        <KanbanColumn
          title="Handed Over"
          orders={orders.handover}
          color="border-teal-500"
          icon={<CheckCircle size={20} className="text-teal-600" />}
          onMove={handleMoveOrder}
        />
      </div>

      {/* Legend / Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> Orders in the &quot;Cooking&quot; stage will show a timer based on
          the menu item prep time. The timer will turn red if the order exceeds the expected prep time.
          Use the action buttons to move orders through the workflow.
        </p>
      </div>
    </div>
  );
}
