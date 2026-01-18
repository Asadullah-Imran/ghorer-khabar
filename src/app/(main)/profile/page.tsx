import BecomeSellerButton from "@/components/profile/BecomeSellerButton";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { SubscriptionActions } from "@/components/profile/ProfileInteractions";
import {
    ACTIVE_SUBSCRIPTION,
    USER_PROFILE
} from "@/lib/dummy-data/profile";
import {
    CalendarCheck,
    ChevronRight,
    Heart,
    MapPin,
    Phone,
    Settings,
    ShoppingBag,
    Users,
    Utensils
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";

export default async function ProfilePage() {
  const userId = await getAuthUserId();
  
  // Fetch user role to conditionally show "Become a Seller" button
  const user = userId ? await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  }) : null;
  
  const recentOrders = userId ? await prisma.order.findMany({
    where: { userId },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      kitchen: true,
      items: {
        take: 1,
        include: { menuItem: true }
      }
    }
  }) : [];
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* 1. Hero Section with Profile & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <ProfileHeader />

          {/* Impact Stats - Enhanced */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Impact
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Users size={22} />
                  </div>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                    +{USER_PROFILE.stats.chefsSupported}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {USER_PROFILE.stats.chefsSupported} Chefs
                </h3>
                <p className="text-sm text-gray-500">Empowered local women</p>
              </div>

              <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Utensils size={22} />
                  </div>
                  <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    This month
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {USER_PROFILE.stats.ordersThisMonth} Orders
                </h3>
                <p className="text-sm text-gray-500">Successfully delivered</p>
              </div>

              <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-red-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Heart size={22} />
                  </div>
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                    Saved
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {USER_PROFILE.stats.favorites} Dishes
                </h3>
                <p className="text-sm text-gray-500">In your favorites</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Active Subscription & History */}
          <div className="xl:col-span-2 space-y-6">
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-teal flex items-center justify-center text-white shadow-lg">
                    <CalendarCheck size={20} />
                  </div>
                  Active Tiffin Plan
                </h2>
                <Link
                  href="/profile/my-subscription"
                  className="text-sm font-semibold text-brand-teal hover:text-brand-teal/80 transition-colors px-4 py-2 rounded-lg hover:bg-brand-teal/5"
                >
                  Manage Plan
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  <div className="relative w-full md:w-1/3 aspect-video md:aspect-auto rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={ACTIVE_SUBSCRIPTION.image}
                      alt="Tiffin"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-brand-teal uppercase tracking-wider">
                      Lunch
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            {ACTIVE_SUBSCRIPTION.title}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Provided by{" "}
                            <span className="text-brand-teal font-medium">
                              {ACTIVE_SUBSCRIPTION.provider}
                            </span>
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                          Active
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase font-semibold">
                            {"Tomorrow's Menu"}
                          </p>
                          <p className="font-medium text-gray-900 text-sm mt-1">
                            {ACTIVE_SUBSCRIPTION.nextMenu}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase font-semibold">
                            Next Delivery
                          </p>
                          <p className="font-medium text-gray-900 text-sm mt-1">
                            {ACTIVE_SUBSCRIPTION.nextDelivery}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Buttons Component */}
                    <SubscriptionActions />
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>Includes 20 meals/month</span>
                  <span>Renewal: {ACTIVE_SUBSCRIPTION.renewalDate}</span>
                </div>
              </div>
            </section>

            {/* Recent Order History */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold text-gray-900">
                  Recent Orders
                </h2>
                <Link 
                  href="/orders"
                  className="text-sm font-semibold text-brand-teal hover:text-brand-teal/80 transition-colors px-4 py-2 rounded-lg hover:bg-brand-teal/5"
                >
                  View All
                </Link>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                      <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Kitchen</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentOrders.length > 0 ? (
                        recentOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {order.kitchen.name}
                            <div className="text-xs text-gray-400 font-normal">
                              {order.items[0]?.quantity}x {order.items[0]?.menuItem.name} {order.items.length > 1 ? `+${order.items.length - 1} more` : ""}
                            </div>
                          </td>
                          <td className="px-6 py-4">৳{order.total}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                order.status === "COMPLETED"
                                  ? "bg-green-100 text-green-700"
                                  : order.status === "CANCELLED"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/orders/${order.id}`} className="text-brand-teal hover:text-brand-teal/80 font-medium text-xs uppercase flex items-center gap-1 ml-auto">
                              Details <ChevronRight size={14} />
                            </Link>
                          </td>
                        </tr>
                      ))
                      ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                No recent orders found.
                            </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>

          {/* Right: Quick Actions */}
          <div className="xl:col-span-1">
            {/* Become a Seller Button - Only show for BUYER users */}
            {user?.role === "BUYER" && <BecomeSellerButton />}
            
            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              Quick Actions
            </h2>
            <div className="bg-white rounded-2xl border border-gray-200 p-3 shadow-lg space-y-1">
              <Link
                href="/orders"
                className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 text-gray-700 transition-all text-left group border border-transparent hover:border-teal-200"
              >
                <div className="bg-teal-100 p-2.5 rounded-xl text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm">
                  <ShoppingBag size={18} />
                </div>
                <span className="font-semibold text-sm flex-1">My Orders</span>
                <ChevronRight
                  size={18}
                  className="text-gray-400 group-hover:text-teal-600 transition-colors"
                />
              </Link>

              <Link
                href="/profile/favorites"
                className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 text-gray-700 transition-all text-left group border border-transparent hover:border-red-200"
              >
                <div className="bg-red-100 p-2.5 rounded-xl text-red-600 group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
                  <Heart size={18} />
                </div>
                <span className="font-semibold text-sm flex-1">Favorites</span>
                <ChevronRight
                  size={18}
                  className="text-gray-400 group-hover:text-red-600 transition-colors"
                />
              </Link>

              <Link
                href="/profile/addresses"
                className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-gray-700 transition-all text-left group border border-transparent hover:border-blue-200"
              >
                <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                  <MapPin size={18} />
                </div>
                <span className="font-semibold text-sm flex-1">
                  Saved Addresses
                </span>
                <ChevronRight
                  size={18}
                  className="text-gray-400 group-hover:text-blue-600 transition-colors"
                />
              </Link>

              <Link
                href="/profile/subscription"
                className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-brand-teal/10 hover:to-brand-teal/5 text-gray-700 transition-all text-left group border border-transparent hover:border-brand-teal/30"
              >
                <div className="bg-brand-teal/10 p-2.5 rounded-xl text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-all shadow-sm">
                  <CalendarCheck size={18} />
                </div>
                <span className="font-semibold text-sm flex-1">
                  Subscription Plans
                </span>
                <ChevronRight
                  size={18}
                  className="text-gray-400 group-hover:text-brand-teal transition-colors"
                />
              </Link>

              <Link
                href="/profile/settings"
                className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 text-gray-700 transition-all text-left group border border-transparent hover:border-gray-300"
              >
                <div className="bg-gray-100 p-2.5 rounded-xl text-gray-600 group-hover:bg-gray-700 group-hover:text-white transition-all shadow-sm">
                  <Settings size={18} />
                </div>
                <span className="font-semibold text-sm flex-1">
                  Account Settings
                </span>
                <ChevronRight
                  size={18}
                  className="text-gray-400 group-hover:text-gray-700 transition-colors"
                />
              </Link>

              <Link
                href="/support"
                className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 text-gray-700 transition-all text-left group border border-transparent hover:border-primary/30"
              >
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <Phone size={18} />
                </div>
                <span className="font-semibold text-sm flex-1">
                  Help & Support
                </span>
                <ChevronRight
                  size={18}
                  className="text-gray-400 group-hover:text-primary transition-colors"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
