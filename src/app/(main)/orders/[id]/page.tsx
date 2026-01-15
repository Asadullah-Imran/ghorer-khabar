import { prisma } from "@/lib/prisma/prisma";
import { CheckCircle, ChevronRight, Clock, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailsPage({ params }: PageProps) {
  const { id } = await params;

  // Support searching by full UUID or partial ID (last 8 chars)
  const order = await prisma.order.findFirst({
    where: {
        OR: [
            { id: id },
            { id: { endsWith: id } } // Matches friendly ID (e.g. GK-7742 if stored as full UUID)
        ]
    },
    include: {
        items: {
            include: {
                menuItem: true
            }
        },
        kitchen: true,
        user: true
    }
  });

  if (!order) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Success Header */}
        <div className="bg-teal-700 text-white rounded-t-xl p-8 text-center">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <CheckCircle size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-teal-100">Order ID: #{order.id.slice(-8).toUpperCase()}</p>
        </div>

        {/* Order Status */}
        <div className="bg-white p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                        {order.status}
                    </span>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
                    <div className="flex items-center gap-1 text-gray-900 font-bold">
                        <Clock size={16} />
                        <span>30-45 mins</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-white p-6 border-b border-gray-100">
             <h3 className="font-bold text-gray-900 mb-4">Delivery Details</h3>
             <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                    <MapPin className="text-gray-400 mt-1" size={18} />
                    <div>
                        <p className="font-semibold text-gray-900">Delivery Address</p>
                        <p className="text-gray-500 text-sm">{order.user.name}'s Saved Address (from profile)</p> 
                        <p className="text-xs text-amber-600 mt-1">Note: We used your profile address.</p>
                    </div>
                </div>
                  <div className="flex items-start gap-3">
                    <Phone className="text-gray-400 mt-1" size={18} />
                    <div>
                        <p className="font-semibold text-gray-900">Contact Number</p>
                        <p className="text-gray-500 text-sm">{order.user.phone || "N/A"}</p>
                    </div>
                </div>
             </div>
        </div>

        {/* Items */}
        <div className="bg-white p-6 rounded-b-xl shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
                {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded text-gray-500 font-bold text-xs">
                                {item.quantity}x
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{item.menuItem.name}</p>
                                <p className="text-xs text-gray-500">From {order.kitchen.name}</p>
                            </div>
                        </div>
                        <p className="font-bold text-gray-900">৳{item.price * item.quantity}</p>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                    <span>Total Paid</span>
                    <span className="text-teal-700">৳{order.total}</span>
                </div>
            </div>

            <div className="mt-8 flex gap-3">
                <Link href="/explore" className="flex-1 bg-gray-100 text-gray-900 font-bold py-3 rounded-lg text-center hover:bg-gray-200 transition">
                    Back to Home
                </Link>
                <Link href="/orders" className="flex-1 bg-teal-700 text-white font-bold py-3 rounded-lg text-center hover:bg-teal-800 transition flex items-center justify-center gap-2">
                    <span>Track Order</span>
                    <ChevronRight size={18} />
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
}
