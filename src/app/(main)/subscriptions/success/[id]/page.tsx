import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SubscriptionSuccessPage({ params }: PageProps) {
  const userId = await getAuthUserId();
  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;

  // Fetch subscription with all relations
  const subscription = await prisma.user_subscriptions.findFirst({
    where: {
      OR: [
        { id: id },
        { id: { endsWith: id } }
      ],
      userId, // Ensure user owns this subscription
    },
    include: {
      plan: {
        include: {
          kitchen: {
            include: {
              seller: true,
            },
          },
        },
      },
      kitchen: {
        include: {
          seller: true,
        },
      },
      user: true,
    },
  });

  if (!subscription) return notFound();

  const friendlyId = `#${subscription.id.slice(-4).toUpperCase()}`;
  const chef = subscription.kitchen.seller;
  const chefQuote = subscription.plan.chef_quote || "I'm excited to prepare delicious meals for you! Can't wait to share the flavors of home cooking.";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Success & Details */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Success Hero Card */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
              <div className="mb-6">
                <div className="size-48 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-orange-500 text-8xl">soup_kitchen</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
                Subscription Placed Successfully!
              </h1>
              <p className="text-gray-600 text-lg max-w-lg mx-auto">
                Your request has been sent to <span className="font-semibold text-teal-700">{subscription.kitchen.name}</span>. We will notify you as soon as they confirm your slot.
              </p>
            </div>

            {/* Timeline Section */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-8 text-gray-900">What's Next?</h3>
              <div className="relative px-4">
                <div className="absolute top-5 left-4 right-4 h-0.5 bg-gray-200"></div>
                <div className="grid grid-cols-3 gap-4 relative z-10">
                  {/* Step 1: Done */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="size-10 rounded-full bg-teal-700 flex items-center justify-center text-white shadow-lg">
                      <span className="material-symbols-outlined text-xl font-bold">check</span>
                    </div>
                    <p className="text-sm font-bold text-teal-700 text-center">Sent to Chef</p>
                  </div>
                  {/* Step 2: Pending */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="size-10 rounded-full bg-white border-[3px] border-orange-500 flex items-center justify-center text-orange-500 shadow-lg animate-pulse">
                      <span className="material-symbols-outlined text-xl">schedule</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-sm font-bold text-gray-900 text-center">Chef Review</p>
                      <span className="text-xs font-semibold text-orange-500 uppercase">(Pending)</span>
                    </div>
                  </div>
                  {/* Step 3: Future */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="size-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                      <span className="material-symbols-outlined text-xl">moped</span>
                    </div>
                    <p className="text-sm font-medium text-gray-400 text-center">First Delivery</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chef's Message */}
            <div className="relative">
              <div className="absolute -left-2 top-6 bottom-6 w-1 bg-teal-700/20 rounded-full"></div>
              <div className="ml-4 flex gap-4 items-start">
                <div className="relative shrink-0">
                  <div 
                    className="w-14 h-14 rounded-full bg-gray-200 bg-cover bg-center border-2 border-white shadow-md"
                    style={chef.avatar ? { backgroundImage: `url("${chef.avatar}")` } : {}}
                  >
                    {!chef.avatar && (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined text-2xl">person</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white p-0.5 rounded-full border border-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[12px]">format_quote</span>
                  </div>
                </div>
                <div className="bg-teal-700/5 p-4 rounded-xl rounded-tl-none border border-teal-700/10">
                  <p className="text-gray-700 text-sm leading-relaxed font-medium">
                    "{chefQuote}"
                  </p>
                  <p className="text-teal-700 text-xs font-bold mt-2 uppercase">— {chef.name || 'Chef'}</p>
                </div>
              </div>
            </div>

            {/* Payment Reminder & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Reminder */}
              <div className="col-span-full bg-amber-50 rounded-xl p-6 border border-amber-200 flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-lg shrink-0 text-amber-700">
                  <span className="material-symbols-outlined text-3xl">payments</span>
                </div>
                <div>
                  <h4 className="text-gray-900 font-bold text-lg">Payment Reminder</h4>
                  <p className="text-gray-700 text-base mt-1">
                    This is a Cash on Delivery order. Please have <span className="font-bold bg-white px-1 rounded">৳{subscription.totalAmount}</span> cash ready for the runner on your first delivery.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <button className="w-full py-3 bg-teal-700 hover:bg-teal-800 rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2">
                <span>View My Meal Schedule</span>
                <span className="material-symbols-outlined">calendar_month</span>
              </button>
              <button className="w-full py-3 bg-white border-2 border-gray-300 hover:border-teal-700 hover:text-teal-700 rounded-xl text-gray-900 font-bold flex items-center justify-center gap-2">
                Return to Home Feed
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="bg-teal-700/5 p-4 border-b border-gray-200 flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-gray-600">Order Summary</span>
                <span className="text-xs font-mono bg-white px-2 py-1 rounded text-gray-600">{friendlyId}</span>
              </div>
              
              <div className="p-5 space-y-6">
                {/* Chef Info */}
                <div className="flex items-center gap-3 pb-4 border-b border-dashed border-gray-200">
                  <div 
                    className="size-12 rounded-full bg-gray-200 bg-cover bg-center shrink-0"
                    style={chef.avatar ? { backgroundImage: `url("${chef.avatar}")` } : {}}
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-gray-900">{subscription.kitchen.name}</span>
                      {subscription.kitchen.isVerified && (
                        <span className="material-symbols-outlined text-blue-500 text-[16px]">verified</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-600">
                      {Number(subscription.kitchen.rating)?.toFixed(1) || '0.0'} ★
                    </span>
                  </div>
                </div>

                {/* Plan Details */}
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block">{subscription.plan.name}</span>
                    <span className="text-xs text-gray-600">
                      {subscription.plan.meals_per_day} meal(s) per day • {subscription.plan.servings_per_meal} serving(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span>Starts <strong>{new Date(subscription.startDate).toLocaleDateString()}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span>{subscription.kitchen.area || 'Dhaka'}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Total (Monthly)</span>
                    <span className="text-xl font-black text-teal-700">৳{subscription.totalAmount}</span>
                  </div>
                  <div className="flex justify-end">
                    <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-bold">Cash on Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
