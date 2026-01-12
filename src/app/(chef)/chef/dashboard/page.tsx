import StatCard from "@/components/chef/StatCard";
import RevenueChart from "@/components/chef/RevenueChart";
import NotificationFeed from "@/components/chef/NotificationFeed";
import KitchenStatusToggle from "@/components/chef/KitchenStatusToggle";
import { CHEF_STATS } from "@/lib/dummy-data/chef";
import { Banknote, Trophy, UtensilsCrossed } from "lucide-react";

export default function ChefDashboard() {
  return (
    <div className="p-6 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900">
            Kitchen Dashboard
          </h1>
          <p className="text-gray-500 mt-2">Welcome back, Chef! 👋</p>
        </div>
        <KitchenStatusToggle />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Revenue */}
        <StatCard
          title="Today's Revenue"
          value={CHEF_STATS.revenueToday}
          subtitle="Last 24 hours"
          icon={<Banknote size={24} />}
          iconColor="text-green-600"
          trend={{ value: 12, isPositive: true }}
        />

        {/* Active Orders */}
        <StatCard
          title="Active Orders"
          value={CHEF_STATS.activeOrders}
          subtitle="In progress"
          icon={<UtensilsCrossed size={24} />}
          iconColor="text-blue-600"
          badge="On Track"
          badgeColor="bg-blue-100 text-blue-800"
        />

        {/* KRI Score */}
        <StatCard
          title="Kitchen Reliability Index"
          value={CHEF_STATS.kriScore}
          subtitle="Excellent standing"
          icon={<Trophy size={24} />}
          iconColor="text-yellow-600"
          badge="Top Rated"
          badgeColor="bg-yellow-100 text-yellow-800"
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Revenue Chart */}
        <div className="lg:col-span-2">
          <RevenueChart
            data={CHEF_STATS.monthlyRevenue}
            currency="৳"
            title="Monthly Revenue"
          />
        </div>

        {/* Right Column: Notifications */}
        <div className="lg:col-span-1">
          <NotificationFeed notifications={CHEF_STATS.notifications} />
        </div>
      </div>
    </div>
  );
}
