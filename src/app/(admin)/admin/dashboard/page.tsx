"use client";

import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  AlertCircle,
  Download,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOnboarding: number;
  orderStatusBreakdown: Array<{ status: string; _count: number }>;
  kitchenRevenue: Array<{
    id: string;
    name: string;
    totalRevenue: number;
    totalOrders: number;
    rating: number;
  }>;
  topMenuItems: Array<{
    id: string;
    name: string;
    price: number;
    rating: number;
    reviewCount: number;
  }>;
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    user: { name: string; email: string };
    kitchen: { name: string };
    createdAt: string;
  }>;
  weeklyData: Array<{
    name: string;
    users: number;
    orders: number;
    completedOrders: number;
    revenue: number;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExport = async () => {
    try {
      const res = await fetch("/api/admin/export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard-report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export report:", error);
    }
  };

  const StatCard = ({
    icon,
    label,
    value,
    trend,
    color,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    trend?: number;
    color: string;
  }) => (
    <div className="bg-surface-dark border border-border-dark p-6 rounded-xl">
      <div className="flex justify-between items-start mb-4">
        <span className="text-text-muted text-sm font-medium">{label}</span>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      {trend !== undefined && (
        <div
          className={`text-xs flex items-center gap-1 ${
            trend >= 0 ? "text-primary" : "text-red-400"
          }`}
        >
          {trend >= 0 ? (
            <TrendingUp size={12} />
          ) : (
            <TrendingDown size={12} />
          )}
          {Math.abs(trend)}% from last month
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  const COLORS = ["#11d4b4", "#f97316", "#ef4444", "#8b5cf6"];

  // Use real weekly data from API
  const chartData = stats?.weeklyData || [];

  return (
    <main className="flex-1 overflow-y-auto flex flex-col">
      <AdminHeader title="Dashboard Overview" />

      <div className="p-8 space-y-8">
        {/* Top Section */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold">Platform Overview</h2>
            <p className="text-text-muted text-sm mt-1">
              Real-time analytics and insights
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark font-bold rounded-lg text-sm shadow-[0_0_15px_rgba(17,212,180,0.3)] hover:shadow-[0_0_25px_rgba(17,212,180,0.5)]"
          >
            <Download size={16} /> Export Report
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            icon={<Users size={20} />}
            label="Total Users"
            value={stats?.totalUsers || 0}
            trend={12}
            color="bg-blue-500/10 text-blue-400"
          />
          <StatCard
            icon={<Package size={20} />}
            label="Active Sellers"
            value={stats?.totalSellers || 0}
            trend={8}
            color="bg-purple-500/10 text-purple-400"
          />
          <StatCard
            icon={<ShoppingCart size={20} />}
            label="Total Orders"
            value={stats?.totalOrders || 0}
            trend={15}
            color="bg-green-500/10 text-green-400"
          />
          <StatCard
            icon={<BarChart3 size={20} />}
            label="Total Revenue"
            value={`৳${(stats?.totalRevenue || 0).toLocaleString()}`}
            trend={20}
            color="bg-primary/10 text-primary"
          />
          <StatCard
            icon={<AlertCircle size={20} />}
            label="Pending Approvals"
            value={stats?.pendingOnboarding || 0}
            color="bg-red-500/10 text-red-400"
          />
        </div>

        {/* Pending Approvals Section */}
        {stats && stats.pendingOnboarding > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={24} className="text-red-400" />
                <div>
                  <h3 className="font-bold text-lg text-red-400">Pending Seller Approvals</h3>
                  <p className="text-text-muted text-sm">
                    {stats.pendingOnboarding} seller{stats.pendingOnboarding !== 1 ? 's' : ''} waiting for verification
                  </p>
                </div>
              </div>
              <a
                href="/admin/onboarding"
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
              >
                Review Now
              </a>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line Chart */}
          <div className="lg:col-span-2 bg-surface-dark border border-border-dark p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-1">Weekly Performance</h3>
            <p className="text-text-muted text-sm mb-6">
              New Users, Orders, and Revenue trends
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a403d" />
                <XAxis dataKey="name" stroke="#8b9a97" />
                <YAxis stroke="#8b9a97" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a2421",
                    border: "1px solid #2a403d",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => {
                    if (value > 1000) {
                      return `৳${(value / 1000).toFixed(1)}k`;
                    }
                    return value;
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="New Users"
                  stroke="#11d4b4"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="completedOrders"
                  name="Completed Orders"
                  stroke="#f97316"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (৳)"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Pie Chart */}
          <div className="bg-surface-dark border border-border-dark p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-1">Order Status</h3>
            <p className="text-text-muted text-sm mb-6">Distribution</p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.orderStatusBreakdown || []}
                  dataKey="_count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Kitchen Revenue & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Kitchens */}
          <div className="bg-surface-dark border border-border-dark p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-6">Top Kitchens by Revenue</h3>
            <div className="space-y-4">
              {stats?.kitchenRevenue.map((kitchen, index) => (
                <div
                  key={kitchen.id}
                  className="flex items-center justify-between p-3 bg-background-dark rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{kitchen.name}</p>
                      <p className="text-xs text-text-muted">
                        {kitchen.totalOrders} orders
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      ৳{kitchen.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-text-muted">
                      ⭐ {kitchen.rating}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-surface-dark border border-border-dark p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-6">Recent Orders</h3>
            <div className="space-y-4">
              {stats?.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-background-dark rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{order.kitchen.name}</p>
                    <p className="text-xs text-text-muted">
                      {order.user.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">৳{order.total.toLocaleString()}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        order.status === "COMPLETED"
                          ? "bg-green-500/20 text-green-400"
                          : order.status === "PENDING"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}