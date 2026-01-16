import ActiveSubscriptionCard from "@/components/subscription/ActiveSubscriptionCard";
import DeliveryCalendar from "@/components/subscription/DeliveryCalendar";
import SubscriptionHistory from "@/components/subscription/SubscriptionHistory";
import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { BadgeCheck, PlusCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MySubscriptionsPage() {
  const userId = await getAuthUserId();
  if (!userId) {
    redirect("/login");
  }

  // Fetch user's subscriptions from database
  const subscriptions = await prisma.user_subscriptions.findMany({
    where: {
      userId,
      status: {
        in: ["PENDING", "ACTIVE", "PAUSED"],
      },
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
      kitchen: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform data to match component expectations
  const transformedSubscriptions = subscriptions.map((sub) => ({
    id: sub.id,
    planName: sub.plan.name,
    planImage: sub.plan.cover_image || "/placeholder-plan.jpg",
    chefName: sub.plan.kitchen.seller.name || "Chef",
    chefImage: sub.plan.kitchen.seller.avatar || "/placeholder-chef.jpg",
    status: sub.status, // PENDING, ACTIVE, PAUSED
    nextDelivery: new Date(sub.startDate).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    }),
    nextDish: "Chef's Special",
    renewalDate: new Date(sub.startDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    monthlyPrice: sub.monthlyPrice,
    totalAmount: sub.totalAmount,
  }));

  // Separate active and pending
  const activeSubscriptions = transformedSubscriptions.filter(
    (sub) => sub.status === "ACTIVE" || sub.status === "PAUSED"
  );
  const pendingSubscriptions = transformedSubscriptions.filter(
    (sub) => sub.status === "PENDING"
  );

  // Fetch subscription history (completed/cancelled)
  const historyRecords = await prisma.user_subscriptions.findMany({
    where: {
      userId,
      status: {
        in: ["COMPLETED", "CANCELLED"],
      },
    },
    include: {
      plan: true,
      kitchen: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 10,
  });

  const transformedHistory = historyRecords.map((record) => ({
    id: record.id,
    planName: record.plan.name,
    kitchenName: record.kitchen.name,
    status: record.status,
    startDate: record.startDate,
    endDate: record.endDate || record.cancelledAt || record.updatedAt,
    total: record.totalAmount,
  }));

  // Mock upcoming deliveries for calendar (can be enhanced later)
  const upcomingDeliveries = activeSubscriptions.map((sub, index) => ({
    date: new Date(Date.now() + index * 24 * 60 * 60 * 1000),
    meal: sub.nextDish,
    subscription: sub.planName,
  }));

  const totalActive = activeSubscriptions.length + pendingSubscriptions.length;

  return (
    <div className="max-w-[1200px] mx-auto p-6 md:p-10">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-gray-900 text-3xl font-black tracking-tight">
            My Subscriptions
          </h1>
          <p className="text-gray-500 text-base">
            You have{" "}
            <span className="text-teal-700 font-bold">{totalActive} active plans</span> for
            this month.
          </p>
        </div>
        <Link
          href="/explore?tab=subscriptions"
          className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-teal-700/20 flex items-center gap-2"
        >
          <PlusCircle size={20} />
          Browse New Plans
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Section: Active & Pending Subscriptions + History */}
        <div className="xl:col-span-2 flex flex-col gap-10">
          {/* Pending Subscriptions */}
          {pendingSubscriptions.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-orange-500">schedule</span>
                <h2 className="text-xl font-bold tracking-tight text-gray-900">
                  Pending Approval
                </h2>
              </div>
              <div className="flex flex-col gap-6">
                {pendingSubscriptions.map((subscription) => (
                  <ActiveSubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Active Subscriptions */}
          {activeSubscriptions.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <BadgeCheck className="text-teal-700" size={24} />
                <h2 className="text-xl font-bold tracking-tight text-gray-900">
                  Active Subscriptions
                </h2>
              </div>
              <div className="flex flex-col gap-6">
                {activeSubscriptions.map((subscription) => (
                  <ActiveSubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                  />
                ))}
              </div>
            </section>
          )}

          {/* No Subscriptions Message */}
          {totalActive === 0 && (
            <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
              <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">
                inventory_2
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Active Subscriptions
              </h3>
              <p className="text-gray-600 mb-6">
                Start your meal plan journey by subscribing to a plan!
              </p>
              <Link
                href="/explore?tab=subscriptions"
                className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-bold"
              >
                <PlusCircle size={20} />
                Browse Subscription Plans
              </Link>
            </div>
          )}

          {/* History Table */}
          {transformedHistory.length > 0 && (
            <SubscriptionHistory history={transformedHistory} />
          )}
        </div>

        {/* Right Section: Delivery Calendar Widget */}
        <div className="xl:col-span-1">
          <DeliveryCalendar deliveries={upcomingDeliveries} />
        </div>
      </div>
    </div>
  );
}
