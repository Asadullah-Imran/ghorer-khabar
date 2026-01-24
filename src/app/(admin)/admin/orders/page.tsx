"use client";

import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import Loading from "@/components/ui/Loading";
import {
  Search,
  MoreVertical,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
} from "lucide-react";

interface OrderItem {
  id: string;
  menuItem: {
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  kitchen: {
    id: string;
    name: string;
  };
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(data.orders);
      setFilteredOrders(data.orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    applyFilters(value, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    applyFilters(search, status);
  };

  const applyFilters = (searchValue: string, status: string) => {
    let filtered = orders;

    if (searchValue) {
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(searchValue.toLowerCase()) ||
          o.user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
          o.kitchen.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    if (status !== "ALL") {
      filtered = filtered.filter((o) => o.status === status);
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        setOrders(
          orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        setFilteredOrders(
          filteredOrders.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o
          )
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock size={18} className="text-yellow-400" />;
      case "CONFIRMED":
        return <CheckCircle size={18} className="text-blue-400" />;
      case "PREPARING":
        return <Truck size={18} className="text-orange-400" />;
      case "DELIVERING":
        return <Truck size={18} className="text-purple-400" />;
      case "COMPLETED":
        return <PackageCheck size={18} className="text-green-400" />;
      case "CANCELLED":
        return <XCircle size={18} className="text-red-400" />;
      default:
        return <Clock size={18} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400";
      case "CONFIRMED":
        return "bg-blue-500/20 text-blue-400";
      case "PREPARING":
        return "bg-orange-500/20 text-orange-400";
      case "DELIVERING":
        return "bg-purple-500/20 text-purple-400";
      case "COMPLETED":
        return "bg-green-500/20 text-green-400";
      case "CANCELLED":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Loading variant="inline" />
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto flex flex-col">
      <AdminHeader title="Orders & Transactions" />

      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold mb-2">All Orders</h2>
          <p className="text-text-muted">
            Manage and track all customer orders and transactions
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search by Order ID, email, or kitchen..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-surface-dark bg-neutral-900 border border-border-dark rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="bg-surface-dark bg-neutral-900 border border-border-dark rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-white"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PREPARING">Preparing</option>
            <option value="DELIVERING">Delivering</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-background-dark text-text-muted text-xs uppercase border-b border-border-dark">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Kitchen</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-background-dark/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-primary">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{order.user.name}</p>
                          <p className="text-xs text-text-muted">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">{order.kitchen.name}</td>
                      <td className="px-6 py-4 font-bold">
                        ৳{order.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-muted">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface-dark border border-border-dark rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    Order {selectedOrder.id.slice(0, 8)}
                  </h2>
                  <p className="text-text-muted">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-text-muted hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Customer Info */}
              <div className="bg-background-dark rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-lg">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-muted text-sm">Name</p>
                    <p className="font-medium">{selectedOrder.user.name}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-sm">Email</p>
                    <p className="font-medium">{selectedOrder.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Kitchen Info */}
              <div className="bg-background-dark rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-lg">Kitchen Information</h3>
                <p className="font-medium">{selectedOrder.kitchen.name}</p>
              </div>

              {/* Order Items */}
              <div className="bg-background-dark rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-lg">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.menuItem.name}</p>
                        <p className="text-sm text-text-muted">x{item.quantity}</p>
                      </div>
                      <p className="font-bold">৳{item.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border-dark pt-3 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-primary">৳{selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-background-dark rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-lg">Update Status</h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedOrder.status)}
                  <span className={`px-3 py-1 rounded font-bold ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {["PENDING", "CONFIRMED", "PREPARING", "DELIVERING", "COMPLETED"].map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        disabled={selectedOrder.status === status}
                        className={`px-3 py-2 rounded text-sm font-bold transition-colors ${
                          selectedOrder.status === status
                            ? "bg-primary/20 text-primary"
                            : "bg-border-dark hover:bg-primary/20 hover:text-primary"
                        }`}
                      >
                        {status}
                      </button>
                    )
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full px-4 py-3 bg-primary text-background-dark rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
