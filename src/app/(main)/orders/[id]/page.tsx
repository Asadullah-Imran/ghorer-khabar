import OrderActions from "@/components/orders/OrderActions";
import { ORDER_TRACKING_DATA } from "@/lib/dummy-data/tracking";
import {
  BadgeCheck,
  Banknote,
  Check,
  ChefHat,
  Clock,
  Headset,
  Package,
  Star,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";

// Helper to render the progress steps
const ProgressStep = ({ icon: Icon, label, active, completed }: any) => (
  <div
    className={`flex flex-col items-center gap-2 ${
      !active && !completed ? "opacity-40" : ""
    }`}
  >
    <div
      className={`size-8 rounded-full flex items-center justify-center ring-4 ring-white ${
        completed
          ? "bg-teal-700 text-white"
          : active
          ? "bg-yellow-400 text-teal-900 shadow-md animate-pulse"
          : "bg-gray-200 text-gray-400"
      }`}
    >
      <Icon size={completed ? 14 : 18} strokeWidth={2.5} />
    </div>
    <span
      className={`text-[10px] uppercase tracking-wide font-bold ${
        active
          ? "text-yellow-600"
          : completed
          ? "text-teal-700"
          : "text-gray-400"
      }`}
    >
      {label}
    </span>
  </div>
);

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = ORDER_TRACKING_DATA; // In real app, fetch(id)

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 1. Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 uppercase tracking-wide border border-teal-100">
                Order #{order.id}
              </span>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Clock size={14} /> Placed on {order.placedAt}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-teal-900 tracking-tight">
              Order Tracking
            </h1>
            <p className="text-gray-500 mt-1 text-lg">
              Your meal is being prepared in multiple kitchens
            </p>
          </div>

          {/* Client Component for Interactive Buttons */}
          <OrderActions />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT COL: KITCHEN TRACKERS --- */}
          <div className="lg:col-span-2 space-y-6">
            {order.subOrders.map((subOrder) => (
              <div
                key={subOrder.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Kitchen Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                        <Image
                          src={subOrder.kitchenImage}
                          alt={subOrder.kitchenName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-0.5 rounded-full border border-white">
                        <BadgeCheck size={10} strokeWidth={3} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-teal-900">
                        {subOrder.kitchenName}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Star
                          size={12}
                          className="text-yellow-500 fill-current"
                        />
                        <span className="font-bold text-gray-700">
                          {subOrder.rating}
                        </span>
                        <span>• Hygiene Checked</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-1">
                      Est. Delivery
                    </p>
                    <p className="text-xl font-black text-teal-700">
                      {order.estimatedDelivery}
                    </p>
                  </div>
                </div>

                {/* Progress Area */}
                <div className="p-6">
                  {/* Items List */}
                  <div className="mb-8 flex flex-wrap gap-2">
                    {subOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-gray-50 p-2 pr-4 rounded-lg border border-gray-100"
                      >
                        <div className="bg-white text-teal-700 font-bold px-2 py-1 rounded text-xs shadow-sm border border-gray-100">
                          {item.qty}x
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar Visual */}
                  <div className="relative w-full mb-8">
                    {/* Background Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full z-0"></div>
                    {/* Active Line (Dynamic Width) */}
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-yellow-400 -translate-y-1/2 rounded-full z-0 transition-all duration-1000"
                      style={{ width: subOrder.progressPercent }}
                    ></div>

                    {/* Icons/Steps */}
                    <div className="relative z-10 flex justify-between w-full text-center">
                      <ProgressStep
                        icon={Check}
                        label="Accepted"
                        completed={true}
                      />
                      <ProgressStep
                        icon={UtensilsCrossed}
                        label="Cooking"
                        completed={
                          subOrder.status === "ready" ||
                          subOrder.status === "delivered"
                        }
                        active={subOrder.status === "cooking"}
                      />
                      <ProgressStep
                        icon={Package}
                        label="Ready"
                        completed={subOrder.status === "delivered"}
                        active={subOrder.status === "ready"}
                      />
                      <ProgressStep
                        icon={Truck}
                        label="Delivered"
                        active={subOrder.status === "delivered"}
                      />
                    </div>
                  </div>

                  {/* Dynamic Status Message */}
                  <div
                    className={`rounded-lg p-4 border-l-4 flex gap-3 ${
                      subOrder.status === "ready"
                        ? "bg-green-50 border-green-500"
                        : "bg-teal-50 border-teal-600"
                    }`}
                  >
                    {subOrder.status === "ready" ? (
                      <Check className="text-green-600 shrink-0" />
                    ) : (
                      <ChefHat className="text-teal-700 animate-pulse shrink-0" />
                    )}
                    <div>
                      <p
                        className={`font-bold text-sm ${
                          subOrder.status === "ready"
                            ? "text-green-800"
                            : "text-teal-800"
                        }`}
                      >
                        {subOrder.statusMessage}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {subOrder.statusDetail}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* --- RIGHT COL: BILL & SUPPORT --- */}
          <div className="space-y-6">
            {/* Bill Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4 border-b border-gray-100 pb-3">
                Bill Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Item Total</span>
                  <span>৳{order.bill.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery Fee</span>
                  <span>৳{order.bill.delivery}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Platform Fee</span>
                  <span>৳{order.bill.platform}</span>
                </div>
                <div className="flex justify-between items-center pt-3 mt-3 border-t border-dashed border-gray-200">
                  <span className="font-bold text-lg text-teal-900">
                    Total Amount
                  </span>
                  <span className="font-black text-xl text-teal-700">
                    ৳{order.bill.total}
                  </span>
                </div>

                {/* COD Payment Info */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-100">
                    <Banknote size={16} className="text-yellow-600" />
                    <span className="font-medium text-yellow-700">
                      Payment pending: Cash on Delivery
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Banner */}
            <div className="bg-teal-800 rounded-xl p-5 text-white flex items-center gap-4 shadow-lg shadow-teal-900/10">
              <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm">
                <Headset size={24} />
              </div>
              <div>
                <p className="font-bold text-sm">Have an issue?</p>
                <p className="text-xs text-white/80 mt-0.5">
                  Our support team is here to help 24/7.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
