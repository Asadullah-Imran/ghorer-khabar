"use client";

import { KanbanColumn } from "@/components/chef/Kanban/KanbanColumn.memo";
import { useToast } from "@/contexts/ToastContext";
import {
    CheckCircle,
    Clock,
    PackageCheck,
    Zap,
    History,
} from "lucide-react";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useChefOrdersRealtime } from "@/lib/hooks/useChefOrdersRealtime";
import Loading from "@/components/ui/Loading";
import Link from "next/link";
import Image from "next/image";

type ViewMode = "live" | "history";

export default function OrdersPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("live");
  const {
    orders,
    loading,
    error,
    moveOrder: moveOrderHook,
    rejectOrder: rejectOrderHook,
  } = useChefOrdersRealtime();

  const [rejectConfirm, setRejectConfirm] = useState<{ orderId: string; orderNumber: string } | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>("ALL");
  const toast = useToast();

  // Memoize total orders count
  const totalOrders = useMemo(() => {
    return Object.values(orders).flat().length;
  }, [orders]);

  const handleMoveOrder = useCallback(async (orderId: string, newStatus: string) => {
    try {
      await moveOrderHook(orderId, newStatus);
    } catch (err) {
      toast.error("Update Failed", err instanceof Error ? err.message : "Failed to update order");
    }
  }, [moveOrderHook, toast]);

  const handleRejectOrder = useCallback((orderId: string) => {
    const currentOrder = [
      ...orders.new,
      ...orders.cooking,
      ...orders.ready,
      ...orders.handover,
    ].find((o) => o.id === orderId);

    if (!currentOrder) return;

    setRejectConfirm({
      orderId,
      orderNumber: currentOrder.orderNumber,
    });
  }, [orders]);

  const confirmRejectOrder = useCallback(async () => {
    if (!rejectConfirm) return;

    try {
      setIsRejecting(true);
      await rejectOrderHook(rejectConfirm.orderId);
      setRejectConfirm(null);
    } catch (err) {
      toast.error("Rejection Failed", err instanceof Error ? err.message : "Failed to reject order");
    } finally {
      setIsRejecting(false);
    }
  }, [rejectConfirm, rejectOrderHook, toast]);

  const cancelRejectOrder = useCallback(() => {
    setRejectConfirm(null);
  }, []);

  // Fetch order history
  const fetchOrderHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const response = await fetch(
        `/api/chef/orders/history?status=${historyStatusFilter}&limit=100`,
        { credentials: "include" }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHistoryOrders(data.data || []);
        }
      }
    } catch (err) {
      console.error("Failed to fetch order history:", err);
      toast.error("Error", "Failed to load order history");
    } finally {
      setHistoryLoading(false);
    }
  }, [historyStatusFilter, toast]);

  // Fetch history when view mode changes or filter changes
  useEffect(() => {
    if (viewMode === "history") {
      fetchOrderHistory();
    }
  }, [viewMode, historyStatusFilter, fetchOrderHistory]);

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
            <Clock size={12} /> Pending
          </span>
        );
      case "CONFIRMED":
      case "PREPARING":
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
            <Clock size={12} /> In Progress
          </span>
        );
      case "DELIVERING":
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
            <PackageCheck size={12} /> Delivering
          </span>
        );
      case "COMPLETED":
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <CheckCircle size={12} /> Completed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
            <Clock size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  // Show loading only for live orders view
  if (viewMode === "live" && loading) {
    return (
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Live Orders</h1>
          <p className="text-gray-500 mt-2">Loading orders...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-lg p-4 min-h-[500px] border border-gray-200"
            >
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2].map((j) => (
                  <div
                    key={j}
                    className="bg-white border border-gray-200 rounded-lg p-4 h-32 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (viewMode === "live" && error) {
    return (
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Live Orders</h1>
          <p className="text-red-500 mt-2">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900">
            {viewMode === "live" ? "Live Orders" : "Order History"}
          </h1>
          <p className="text-gray-500 mt-2">
            {viewMode === "live" 
              ? `Manage your kitchen workflow - ${totalOrders} active orders`
              : `View all past orders - ${historyOrders.length} orders`
            }
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setViewMode("live")}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 ${
            viewMode === "live"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Zap size={18} />
          Live Orders
        </button>
        <button
          onClick={() => setViewMode("history")}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 ${
            viewMode === "history"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <History size={18} />
          Order History
        </button>
      </div>

      {/* Live Orders View - Kanban Board */}
      {viewMode === "live" && (
        <React.Fragment>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* New Orders */}
            <KanbanColumn
              title="New Requests"
              orders={orders.new}
              color="border-blue-500"
              icon={<Zap size={20} className="text-blue-600" />}
              onMove={handleMoveOrder}
              onReject={handleRejectOrder}
            />

            {/* Cooking */}
            <KanbanColumn
              title="Cooking"
              orders={orders.cooking}
              color="border-orange-500"
              icon={<Clock size={20} className="text-orange-600" />}
              onMove={handleMoveOrder}
              onReject={handleRejectOrder}
            />

            {/* Ready */}
            <KanbanColumn
              title="Ready for Pickup"
              orders={orders.ready}
              color="border-green-500"
              icon={<PackageCheck size={20} className="text-green-600" />}
              onMove={handleMoveOrder}
              onReject={handleRejectOrder}
            />

            {/* Handover */}
            <KanbanColumn
              title="Handed Over"
              orders={orders.handover}
              color="border-teal-500"
              icon={<CheckCircle size={20} className="text-teal-600" />}
              onMove={handleMoveOrder}
              onReject={handleRejectOrder}
            />
          </div>

          {/* Legend / Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Tip:</strong> Orders in the &quot;Cooking&quot; stage will show a timer based on
              the menu item prep time. The timer will turn red if the order exceeds the expected prep time.
              Use the action buttons to move orders through the workflow.
            </p>
          </div>
        </React.Fragment>
      )}

      {/* Order History View - List */}
      {viewMode === "history" && (
        <div className="space-y-6">
          {/* Filter */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-gray-700">Filter by Status:</label>
            <select
              value={historyStatusFilter}
              onChange={(e) => setHistoryStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="ALL">All Orders</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="DELIVERING">Delivering</option>
            </select>
          </div>

          {/* Orders List */}
          {historyLoading ? (
            <Loading variant="inline" />
          ) : historyOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <History size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No orders found</p>
              <p className="text-sm text-gray-400 mt-1">
                {historyStatusFilter !== "ALL" 
                  ? `No ${historyStatusFilter.toLowerCase()} orders yet.`
                  : "You haven't received any orders yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all hover:border-teal-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Order Images */}
                      <div className="flex -space-x-2">
                        {order.images.slice(0, 3).map((img: string, i: number) => (
                          <div
                            key={i}
                            className="relative w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-200"
                          >
                            <Image
                              src={img}
                              alt="Dish"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                        {order.images.length > 3 && (
                          <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                            +{order.images.length - 3}
                          </div>
                        )}
                      </div>

                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-gray-900">{order.orderNumber}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{order.itemsSummary}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Customer: {order.customerName}
                        </p>
                        {order.deliveryTimeDisplay && order.deliveryTimeDisplay !== "Not set" && (
                          <p className="text-xs text-gray-500 mt-1">
                            Delivery: {order.deliveryTimeDisplay}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Total & Date */}
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-gray-900">৳{order.totalPrice}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(order.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reject Confirmation Dialog */}
      {rejectConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6 animate-in fade-in zoom-in-95">
            {/* Close Button */}
            <button
              onClick={cancelRejectOrder}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              disabled={isRejecting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-12a9 9 0 110 18 9 9 0 010-18z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">Reject Order?</h3>
              <p className="text-gray-600 mt-2">
                Are you sure you want to reject order <span className="font-semibold">{rejectConfirm.orderNumber}</span>?
              </p>
            </div>

            {/* Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                The customer will be notified immediately. This action cannot be undone.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={cancelRejectOrder}
                disabled={isRejecting}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejectOrder}
                disabled={isRejecting}
                className="flex-1 py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRejecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  "Reject Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
