import CancelOrderButton from "@/components/orders/tracking/CancelOrderButton";
import ChefProfileCard from "@/components/orders/tracking/ChefProfileCard";
import ContactChefButton from "@/components/orders/tracking/ContactChefButton";
import DishTrackingCard from "@/components/orders/tracking/DishTrackingCard";
import OrderBillDetails from "@/components/orders/tracking/OrderBillDetails";
import OrderProgressStepper from "@/components/orders/tracking/OrderProgressStepper";
import OrderRealtimeSubscriber from "@/components/orders/tracking/OrderRealtimeSubscriber";
import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { Clock } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

function getStatusMessage(status: string): { icon: string; color: string; message: string } {
  switch (status) {
    case 'PENDING':
      return { icon: 'schedule', color: 'bg-yellow-50 border-yellow-500 text-yellow-800', message: 'Your order has been placed and is waiting to be confirmed by the chef.' };
    case 'CONFIRMED':
      return { icon: 'check_circle', color: 'bg-green-50 border-green-500 text-green-800', message: 'Chef has accepted your order and will start preparing soon!' };
    case 'PREPARING':
      return { icon: 'soup_kitchen', color: 'bg-blue-50 border-blue-500 text-blue-800', message: `${status === 'PREPARING' ? 'is currently preparing' : 'has started preparing'} your delicious meal.` };
    case 'DELIVERING':
      return { icon: 'check_circle', color: 'bg-teal-50 border-teal-500 text-teal-800', message: 'Your order is packed and ready! Our delivery partner will pick it up shortly.' };
    case 'COMPLETED':
      return { icon: 'celebration', color: 'bg-green-50 border-green-500 text-green-800', message: 'Your order has been delivered! Enjoy your meal!' };
    case 'CANCELLED':
      return { icon: 'cancel', color: 'bg-red-50 border-red-500 text-red-800', message: 'This order has been cancelled.' };
    default:
      return { icon: 'info', color: 'bg-gray-100 border-gray-500 text-gray-800', message: 'Processing your order...' };
  }
}

export default async function OrderTrackingPage({ params }: PageProps) {
  const userId = await getAuthUserId();
  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;

  // Fetch order with all relations
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: id },
        { id: { endsWith: id } }
      ],
      userId // Ensure user owns this order
    },
    include: {
      items: {
        include: {
          menuItem: {
            include: {
              menu_item_images: { take: 1 }
            }
          }
        }
      },
      kitchen: {
        include: {
          seller: true
        }
      },
      user: true
    }
  });

  if (!order) return notFound();

  // Use actual delivery date from order, fallback to 45 mins if not set
  const estimatedDelivery = order.delivery_date 
    ? new Date(order.delivery_date)
    : new Date(order.createdAt.getTime() + 45 * 60000);
  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);

  const statusInfo = getStatusMessage(order.status);
  const friendlyOrderId = `GK-${order.id.slice(-8).toUpperCase()}`;

  return (
    <>
      {/* Realtime Subscriber */}
      <OrderRealtimeSubscriber 
        orderId={order.id} 
        userId={userId}
        initialStatus={order.status}
      />

      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-700/10 text-teal-700 uppercase tracking-wide">
                  Order #{friendlyOrderId}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  Placed on {order.createdAt.toLocaleDateString()} at {order.createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-teal-700 tracking-tight">
                Track Your Meal
              </h1>
              <p className="text-gray-600 mt-1 text-lg">
                Real-time updates from {order.kitchen.name}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/orders/${order.id}`}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-900 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Order Details
              </Link>
              <CancelOrderButton orderId={order.id} canCancel={canCancel} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ETA & Progress Card - Full Width */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="space-y-6">
                  {/* Top: Countdown Timer */}
                  <div className="flex items-start gap-4">
                    <Clock className="text-teal-700 flex-shrink-0 mt-1" size={28} />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">Delivery Time</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {new Date(order.delivery_date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })} at {new Date(order.delivery_date).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                        {order.delivery_time_slot && ` (${order.delivery_time_slot})`}
                      </p>
                      <div className="text-4xl font-black font-mono text-teal-700">
                        {(() => {
                          const delivery = new Date(order.delivery_date);
                          const now = new Date();
                          const difference = delivery.getTime() - now.getTime();
                          if (difference <= 0) return "Delivery time has passed";
                          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                          const minutes = Math.floor((difference / 1000 / 60) % 60);
                          if (days > 0) return `${days}d ${hours}h ${minutes}m`;
                          if (hours > 0) return `${hours}h ${minutes}m`;
                          return `${minutes}m`;
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Progress Stepper */}
                  <div className="pt-4 border-t border-gray-100">
                    <OrderProgressStepper 
                      currentStatus={order.status}
                      estimatedDelivery={order.status === 'COMPLETED' ? undefined : estimatedDelivery}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Left Column: Status & Dishes */}
            <div className="lg:col-span-2 space-y-6">
              <div className={`${statusInfo.color} rounded-lg p-4 border-l-4`}>
                <div className="flex gap-3">
                  <span className={`material-symbols-outlined ${order.status === 'PREPARING' ? 'animate-spin' : ''}`}>
                    {statusInfo.icon}
                  </span>
                  <div>
                    <p className="font-bold text-sm">
                      {order.status === 'PREPARING' ? 'Preparation in progress' : 
                       order.status === 'CONFIRMED' ? 'Order Confirmed' :
                       order.status === 'DELIVERING' ? 'Order Ready' :
                       order.status === 'COMPLETED' ? 'Order Delivered' :
                       order.status === 'CANCELLED' ? 'Order Cancelled' :
                       'Order Received'}
                    </p>
                    <p className="text-xs mt-0.5">
                      {order.status === 'PREPARING' && order.kitchen.seller.name
                        ? `${order.kitchen.seller.name} ${statusInfo.message}`
                        : statusInfo.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dishes Section (Replaces Map) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-900">Your Order</h3>
                  <span className="text-sm text-gray-500">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {order.items.map((item) => (
                    <DishTrackingCard
                      key={item.id}
                      dish={item.menuItem}
                      quantity={item.quantity}
                      price={item.price}
                      status={order.status}
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Details */}
            <div className="space-y-6">
              
              {/* Chef Profile */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ChefProfileCard 
                  chef={order.kitchen.seller} 
                  kitchen={{
                    ...order.kitchen,
                    rating: order.kitchen.rating ? Number(order.kitchen.rating) : null
                  }}
                />
                <div className="mt-4">
                  <ContactChefButton 
                    kitchenId={order.kitchen.id}
                    chefName={order.kitchen.seller.name || 'Chef'}
                  />
                </div>
              </div>

              {/* Bill Details */}
              <OrderBillDetails
                items={order.items}
                total={order.total}
                paymentMethod="Cash on Delivery"
              />

              {/* Support Card */}
              <div className="bg-teal-700 rounded-xl p-5 text-white flex items-center gap-4">
                <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[24px]">support_agent</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Have an issue?</p>
                  <p className="text-xs text-white/80 mt-0.5">Our support team is here to help 24/7.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}
