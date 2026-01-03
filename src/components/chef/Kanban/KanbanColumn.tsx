import { Order } from "@/lib/dummy-data/chef";
import OrderCard from "./OrderCard";

interface KanbanColumnProps {
  title: string;
  orders: Order[];
  color: string;
  icon?: React.ReactNode;
  onMove?: (orderId: string, newStatus: string) => void;
}

export default function KanbanColumn({
  title,
  orders,
  color,
  icon,
  onMove,
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
            <OrderCard key={order.id} order={order} onMove={onMove} />
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
