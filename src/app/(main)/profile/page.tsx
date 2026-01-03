import {
  RoleSwitcher,
  SubscriptionActions,
} from "@/components/profile/ProfileInteractions";
import {
  ACTIVE_SUBSCRIPTION,
  ORDER_HISTORY,
  USER_PROFILE,
} from "@/lib/dummy-data/profile";
import {
  CalendarCheck,
  ChevronRight,
  Heart,
  LogOut,
  MapPin,
  Phone,
  Settings,
  Users,
  Utensils,
} from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* 1. Header & Role Switcher */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center text-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 mb-4">
              <Image
                src={USER_PROFILE.avatar}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {USER_PROFILE.name}
            </h1>
            <p className="text-sm text-teal-600 font-medium mb-4">
              {USER_PROFILE.plan}
            </p>

            <div className="w-full space-y-3 text-sm text-gray-500 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400" />
                <span>{USER_PROFILE.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <MapPin size={16} className="text-gray-400 shrink-0" />
                <span>{USER_PROFILE.address}</span>
              </div>
            </div>

            <div className="w-full mt-6 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium">
                <Settings size={16} /> Edit
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 text-sm font-medium">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          {/* Role Switcher & Impact Stats */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* The Mode Switcher */}
            <RoleSwitcher />

            {/* Impact Stats (Replacing Calories) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase">
                    Empowered
                  </p>
                  <h3 className="text-lg font-bold text-gray-900">
                    {USER_PROFILE.stats.chefsSupported} Chefs
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    You supported local women
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                  <Utensils size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase">
                    Orders
                  </p>
                  <h3 className="text-lg font-bold text-gray-900">
                    {USER_PROFILE.stats.ordersThisMonth}
                  </h3>
                  <p className="text-[10px] text-gray-400">This month</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                  <Heart size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase">
                    Favorites
                  </p>
                  <h3 className="text-lg font-bold text-gray-900">
                    {USER_PROFILE.stats.favorites} Dishes
                  </h3>
                  <p className="text-[10px] text-gray-400">Saved for later</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Layout Grid for Subscription & History */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left: Active Subscription */}
          <div className="xl:col-span-2 space-y-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CalendarCheck size={20} className="text-teal-700" />
                  Active Tiffin Plan
                </h3>
                <button className="text-sm font-semibold text-teal-700 hover:underline">
                  Manage Plan
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  <div className="relative w-full md:w-1/3 aspect-video md:aspect-auto rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={ACTIVE_SUBSCRIPTION.image}
                      alt="Tiffin"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-teal-800 uppercase tracking-wider">
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
                            <span className="text-teal-700 font-medium">
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

            {/* Recent Order History Table */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Recent Order History
                </h3>
                <button className="text-sm font-semibold text-teal-700 hover:underline">
                  View All
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
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
                      {ORDER_HISTORY.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            {order.date}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {order.kitchen}
                            <div className="text-xs text-gray-400 font-normal">
                              {order.items}
                            </div>
                          </td>
                          <td className="px-6 py-4">৳{order.total}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                order.status === "Delivered"
                                  ? "bg-green-100 text-green-700"
                                  : order.status === "Cancelled"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-teal-700 hover:text-teal-900 font-medium text-xs uppercase flex items-center gap-1 ml-auto">
                              Details <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>

          {/* Right: Settings / Menu */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm">
              {[
                { icon: Heart, label: "Favorites" },
                { icon: MapPin, label: "Saved Addresses" },
                { icon: CalendarCheck, label: "Subscription Plans" },
                { icon: Settings, label: "Account Settings" },
                { icon: Phone, label: "Help & Support" },
              ].map((item, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors text-left"
                >
                  <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                    <item.icon size={18} />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                  <ChevronRight size={16} className="ml-auto text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
