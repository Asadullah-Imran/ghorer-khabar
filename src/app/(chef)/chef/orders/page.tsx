"use client";

import KanbanColumn from "@/components/chef/Kanban/KanbanColumn";
import { KANBAN_ORDERS, OrderStatus } from "@/lib/dummy-data/chef";
import {
  CheckCircle,
  Clock,
  PackageCheck,
  Zap,
} from "lucide-react";
import { useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState(KANBAN_ORDERS);

  const handleMoveOrder = (orderId: string, newStatus: string) => {
    // Find the order in current columns
    let order = null;
    let currentStatus: OrderStatus = "new";

    for (const status of ["new", "cooking", "ready", "handover"] as OrderStatus[]) {
      const found = orders[status].find((o) => o.id === orderId);
      if (found) {
        order = found;
        currentStatus = status;
        break;
      }
    }

    if (!order) return;

    // Remove from current status
    setOrders((prev) => ({
      ...prev,
      [currentStatus]: prev[currentStatus].filter((o) => o.id !== orderId),
      [newStatus]: [
        ...prev[newStatus as OrderStatus],
        { ...order, status: newStatus as OrderStatus },
      ],
    }));
  };

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
          <strong>💡 Tip:</strong> Orders in the &quot;Cooking&quot; stage will show a timer. The
          timer will turn red and pulse if the order exceeds 20 minutes. Use the action
          buttons to move orders through the workflow.
        </p>
      </div>
    </div>
  );
}
