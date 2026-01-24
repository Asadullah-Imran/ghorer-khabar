import { Phone, ShoppingBag, Truck, Clock, Calendar, Eye } from "lucide-react";
import Link from "next/link";

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
  deliveryDate?: string | null;
  deliveryTimeSlot?: string | null;
  deliveryTimeDisplay?: string;
  userId: string;
}

interface OrderCardProps {
  order: Order;
  onMove?: (orderId: string, newStatus: string) => void;
  onReject?: (orderId: string) => void;
}

export default function OrderCard({ order, onMove, onReject }: OrderCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
      {/* Header: Order Number */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900">{order.orderNumber}</h3>
          <Link
            href={`/chef/orders/${order.id}`}
            className="text-teal-600 hover:text-teal-700 transition-colors"
            title="View order details"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye size={16} />
          </Link>
        </div>
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

      {/* Delivery Time - Prominent Display */}
      {order.deliveryTimeDisplay && (
        <div className="mb-3 p-2.5 bg-teal-50 border-2 border-teal-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-teal-700" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-teal-900 uppercase tracking-wide">
                Delivery Time
              </p>
              <p className="text-sm font-bold text-teal-700 mt-0.5">
                {order.deliveryTimeDisplay}
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* Handover Info */}
      {order.status === "handover" && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
          <p className="font-semibold text-blue-900">Order completed and handed over</p>
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
            <button 
              onClick={() => onReject?.(order.id)}
              className="py-2 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition"
            >
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
