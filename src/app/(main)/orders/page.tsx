import OrderList from "@/components/orders/OrderList";
import { MY_ORDERS } from "@/lib/dummy-data/order-history";
import { ShoppingBag } from "lucide-react";

export default function MyOrdersPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
            <ShoppingBag className="text-teal-700" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500">
              Track current meals or reorder favorites
            </p>
          </div>
        </div>

        {/* The List Logic */}
        <OrderList orders={MY_ORDERS} />
      </div>
    </main>
  );
}
