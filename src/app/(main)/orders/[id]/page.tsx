import DeliveryCountdown from "@/components/orders/DeliveryCountdown";
import OrderItemReviewButton from "@/components/orders/OrderItemReviewButton";
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
        user: true,
        reviews: {
            select: {
                id: true,
                menuItemId: true,
                rating: true,
                comment: true,
            }
        }
    }
  });

  if (!order) return notFound();

  const friendlyOrderId = `GK-${order.id.slice(-8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Success Header */}
        <div className="bg-teal-700 text-white rounded-t-xl p-8 text-center">
            <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm animate-bounce">
                <CheckCircle size={40} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-2">Order Placed Successfully!</h1>
            <p className="text-white/90 text-lg">Thank you for your order</p>
            <p className="text-white/80 mt-2">Order ID: #{friendlyOrderId}</p>
        </div>

        {/* Order Status */}
        <div className="bg-white p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                        {order.status}
                    </span>
                </div>
                <div className="flex-1 sm:text-right">
                    <DeliveryCountdown 
                        deliveryDate={order.delivery_date}
                        deliveryTimeSlot={order.delivery_time_slot}
                        status={order.status}
                        compact={true}
                    />
                </div>
            </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-white p-6 border-b border-gray-100">
             <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-700">local_shipping</span>
                Delivery Details
             </h3>
             <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                    <MapPin className="text-gray-400 mt-1 flex-shrink-0" size={18} />
                    <div>
                        <p className="font-semibold text-gray-900">Delivery Address</p>
                        <p className="text-gray-600 text-sm">{order.user.name}'s Saved Address (from profile)</p> 
                        <p className="text-xs text-amber-600 mt-1">Note: We used your profile address.</p>
                    </div>
                </div>
                  <div className="flex items-start gap-3">
                    <Phone className="text-gray-400 mt-1 flex-shrink-0" size={18} />
                    <div>
                        <p className="font-semibold text-gray-900">Contact Number</p>
                        <p className="text-gray-600 text-sm">{order.user.phone || "N/A"}</p>
                    </div>
                </div>
             </div>
        </div>

        {/* Items */}
        <div className="bg-white p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-700">restaurant</span>
                Order Items
            </h3>
            <div className="space-y-4">
                {order.items.map((item) => {
                    const review = order.reviews.find(
                        (r) => r.menuItemId === item.menuItemId
                    );
                    const hasReviewed = !!review;
                    return (
                        <div key={item.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg text-teal-700 font-bold text-sm">
                                        {item.quantity}x
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{item.menuItem.name}</p>
                                        <p className="text-xs text-gray-500">From {order.kitchen.name}</p>
                                    </div>
                                </div>
                                <p className="font-bold text-teal-700">৳{item.price * item.quantity}</p>
                            </div>
                            {order.status === "COMPLETED" && (
                                <OrderItemReviewButton
                                    menuItemId={item.menuItemId}
                                    menuItemName={item.menuItem.name}
                                    orderId={order.id}
                                    orderDate={order.createdAt}
                                    hasReviewed={hasReviewed}
                                    reviewId={review?.id}
                                    reviewRating={review?.rating}
                                    reviewComment={review?.comment}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                    <span>Total Paid</span>
                    <span className="text-teal-700 text-2xl">৳{order.total}</span>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white p-6 rounded-b-xl shadow-sm border-t border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                    href="/explore" 
                    className="flex-1 bg-gray-100 text-gray-900 font-bold py-3 rounded-lg text-center hover:bg-gray-200 transition"
                >
                    Continue Shopping
                </Link>
                <Link 
                    href={`/orders/${order.id}/track`}
                    className="flex-1 bg-teal-700 text-white font-bold py-3 rounded-lg text-center hover:bg-teal-800 transition flex items-center justify-center gap-2 shadow-md"
                >
                    <span className="material-symbols-outlined">location_on</span>
                    <span>Track Order</span>
                    <ChevronRight size={18} />
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
}
