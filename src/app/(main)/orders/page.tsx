import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { ArrowRight, Clock, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OrderHistoryPage() {
  const userId = await getAuthUserId();
  
  if (!userId) {
      redirect("/login");
  }

  const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
          kitchen: true,
          items: {
              take: 1,
              include: { menuItem: true }
          }
      }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
            <ShoppingBag className="text-teal-700" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
        </div>

        {orders.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package size={40} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't placed any orders yet.</p>
                <Link href="/explore" className="inline-flex items-center justify-center gap-2 bg-teal-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-teal-800 transition">
                    Start Exploring
                </Link>
            </div>
        ) : (
            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            {/* Order Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-lg text-gray-900">
                                        {order.kitchen.name}
                                    </h3>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                                
                                <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                                    <Clock size={14} />
                                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                </p>

                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="min-w-[40px] h-[40px] bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-500">
                                        {order.items[0]?.quantity}x
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm line-clamp-1">
                                            {order.items[0]?.menuItem.name}
                                        </p>
                                        {/* TODO: Add logic to show "+ X more items" */}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col items-end justify-between min-w-[120px]">
                                <p className="text-lg font-bold text-teal-700">৳{order.total}</p>
                                <Link 
                                    href={`/orders/${order.id}`}
                                    className="flex items-center gap-1 text-sm font-bold text-teal-700 hover:text-teal-900 hover:underline mt-4"
                                >
                                    View Details <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
