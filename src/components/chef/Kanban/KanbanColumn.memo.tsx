"use client";

import { memo } from "react";
import OrderCard from "./OrderCard";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: "new" | "cooking" | "ready" | "handover";
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalPrice: number;
  specialNotes?: string;
  createdAt: Date;
  prepTime: number;
  userId: string;
}

interface KanbanColumnProps {
  title: string;
  orders: Order[];
  color: string;
  icon?: React.ReactNode;
  onMove?: (orderId: string, newStatus: string) => void;
  onReject?: (orderId: string) => void;
}

function KanbanColumnComponent({
  title,
  orders,
  color,
  icon,
  onMove,
  onReject,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col bg-gray-50 rounded-lg p-4 min-h-[500px] border border-gray-200">
      {/* Column Header */}
      <div className={`flex items-center gap-2 mb-4 pb-3 border-b-2 ${color}`}>
        {icon && <div className="text-xl">{icon}</div>}
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{orders.length} order(s)</p>
        </div>
      </div>

      {/* Orders Container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {orders.length > 0 ? (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} onMove={onMove} onReject={onReject} />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No orders
          </div>
        )}
      </div>
    </div>
  );
}

// Memoize with custom comparison
export const KanbanColumn = memo(KanbanColumnComponent, (prevProps, nextProps) => {
  // Only re-render if orders array changes or handlers change
  return (
    prevProps.title === nextProps.title &&
    prevProps.color === nextProps.color &&
    prevProps.orders.length === nextProps.orders.length &&
    prevProps.orders.every((order, idx) => {
      const nextOrder = nextProps.orders[idx];
      return nextOrder && order.id === nextOrder.id && order.status === nextOrder.status;
    })
  );
});
