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
    <div className="min-h-screen bg-background-light dark:bg-background-dark py-10 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Success Header */}
        <div className="bg-brand-teal dark:bg-brand-teal/90 text-white rounded-t-xl p-8 text-center">
            <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm animate-bounce">
                <CheckCircle size={40} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-2">Order Placed Successfully!</h1>
            <p className="text-white/90 text-lg">Thank you for your order</p>
            <p className="text-white/80 mt-2">Order ID: #{friendlyOrderId}</p>
        </div>

        {/* Order Status */}
        <div className="bg-white dark:bg-white/5 p-6 border-b border-gray-100 dark:border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-text-secondary dark:text-gray-400 mb-1">Status</p>
                    <span className="inline-block px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm font-bold">
                        {order.status}
                    </span>
                </div>
                <div className="text-center sm:text-right">
                    <p className="text-sm text-text-secondary dark:text-gray-400 mb-1">Estimated Delivery</p>
                    <div className="flex items-center gap-2 text-brand-teal dark:text-primary font-bold text-lg">
                        <Clock size={20} />
                        <span>30-45 mins</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-white dark:bg-white/5 p-6 border-b border-gray-100 dark:border-white/10">
             <h3 className="font-bold text-text-main dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-teal">local_shipping</span>
                Delivery Details
             </h3>
             <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                    <MapPin className="text-gray-400 mt-1 flex-shrink-0" size={18} />
                    <div>
                        <p className="font-semibold text-text-main dark:text-white">Delivery Address</p>
                        <p className="text-text-secondary dark:text-gray-400 text-sm">{order.user.name}'s Saved Address (from profile)</p> 
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Note: We used your profile address.</p>
                    </div>
                </div>
                  <div className="flex items-start gap-3">
                    <Phone className="text-gray-400 mt-1 flex-shrink-0" size={18} />
                    <div>
                        <p className="font-semibold text-text-main dark:text-white">Contact Number</p>
                        <p className="text-text-secondary dark:text-gray-400 text-sm">{order.user.phone || "N/A"}</p>
                    </div>
                </div>
             </div>
        </div>

        {/* Items */}
        <div className="bg-white dark:bg-white/5 p-6">
            <h3 className="font-bold text-text-main dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-teal">restaurant</span>
                Order Items
            </h3>
            <div className="space-y-4">
                {order.items.map((item) => {
                    const review = order.reviews.find(
                        (r) => r.menuItemId === item.menuItemId
                    );
                    const hasReviewed = !!review;
                    return (
                        <div key={item.id} className="pb-4 border-b border-gray-100 dark:border-white/5 last:border-0 last:pb-0">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 flex items-center justify-center bg-background-light dark:bg-white/10 rounded-lg text-brand-teal dark:text-primary font-bold text-sm">
                                        {item.quantity}x
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-main dark:text-white">{item.menuItem.name}</p>
                                        <p className="text-xs text-text-secondary dark:text-gray-400">From {order.kitchen.name}</p>
                                    </div>
                                </div>
                                <p className="font-bold text-brand-teal dark:text-primary">৳{item.price * item.quantity}</p>
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

            <div className="mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-white/10">
                <div className="flex justify-between items-center text-lg font-bold text-text-main dark:text-white">
                    <span>Total Paid</span>
                    <span className="text-brand-teal dark:text-primary text-2xl">৳{order.total}</span>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-white/5 p-6 rounded-b-xl shadow-lg border-t border-gray-100 dark:border-white/10">
            <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                    href="/explore" 
                    className="flex-1 bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white font-bold py-3 rounded-lg text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    Continue Shopping
                </Link>
                <Link 
                    href={`/orders/${order.id}/track`}
                    className="flex-1 bg-brand-teal dark:bg-primary text-white dark:text-text-main font-bold py-3 rounded-lg text-center hover:bg-teal-800 dark:hover:bg-yellow-400 transition flex items-center justify-center gap-2 shadow-md"
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
