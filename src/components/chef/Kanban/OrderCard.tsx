import { Order } from "@/lib/dummy-data/chef";
import { Phone, ShoppingBag, Truck } from "lucide-react";
import TimerBadge from "./TimerBadge";

interface OrderCardProps {
  order: Order;
  onMove?: (orderId: string, newStatus: string) => void;
}

export default function OrderCard({ order, onMove }: OrderCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
      {/* Header: Order Number & Timer */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">{order.orderNumber}</h3>
        {(order.status === "cooking" || order.status === "ready") && (
          <TimerBadge startTime={order.startTime} warningThreshold={20} />
        )}
      </div>

      {/* Customer Info */}
      <div className="mb-3">
        <p className="text-sm font-semibold text-gray-900">
          {order.customerName}
        </p>
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <Phone size={12} />
          <span>{order.customerPhone}</span>
        </div>
      </div>

      {/* Items List */}
      <div className="mb-3 pb-3 border-b border-gray-100">
        <div className="space-y-1">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-gray-700">
                {item.quantity}x {item.name}
              </span>
              <span className="text-gray-500">৳{item.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Special Notes */}
      {order.specialNotes && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          <p className="font-semibold">Note:</p>
          <p>{order.specialNotes}</p>
        </div>
      )}

      {/* Runner/Tiffin Info (if handover) */}
      {order.status === "handover" && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs space-y-1">
          <div className="flex items-center gap-1">
            <Truck size={12} className="text-blue-600" />
            <span className="font-semibold text-blue-900">
              {order.runnerId}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ShoppingBag size={12} className="text-blue-600" />
            <span className="font-semibold text-blue-900">
              {order.tiffinId}
            </span>
          </div>
        </div>
      )}

      {/* Total Price */}
      <div className="flex items-center justify-between mb-3 pt-2 border-t border-gray-100">
        <span className="text-sm font-semibold text-gray-600">Total</span>
        <span className="text-lg font-bold text-teal-700">
          ৳{order.totalPrice}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {order.status === "new" && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onMove?.(order.id, "cooking")}
              className="py-2 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition"
            >
              Accept
            </button>
            <button className="py-2 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition">
              Reject
            </button>
          </div>
        )}
        {order.status === "cooking" && (
          <button
            onClick={() => onMove?.(order.id, "ready")}
            className="w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition"
          >
            Mark Ready
          </button>
        )}
        {order.status === "ready" && (
          <button
            onClick={() => onMove?.(order.id, "handover")}
            className="w-full py-2 bg-purple-600 text-white text-xs font-semibold rounded hover:bg-purple-700 transition"
          >
            Handover
          </button>
        )}
      </div>
    </div>
  );
}
