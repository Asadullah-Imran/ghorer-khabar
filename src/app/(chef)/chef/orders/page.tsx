"use client";

import { KanbanColumn } from "@/components/chef/Kanban/KanbanColumn.memo";
import { useToast } from "@/contexts/ToastContext";
import {
    CheckCircle,
    Clock,
    PackageCheck,
    Zap,
} from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { useChefOrdersRealtime } from "@/lib/hooks/useChefOrdersRealtime";

export default function OrdersPage() {
  const {
    orders,
    loading,
    error,
    moveOrder: moveOrderHook,
    rejectOrder: rejectOrderHook,
  } = useChefOrdersRealtime();

  const [rejectConfirm, setRejectConfirm] = useState<{ orderId: string; orderNumber: string } | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
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

  if (loading) {
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

  if (error) {
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
      <div>
        <h1 className="text-4xl font-black text-gray-900">Live Orders</h1>
        <p className="text-gray-500 mt-2">
          Manage your kitchen workflow - {totalOrders} orders
        </p>
      </div>

      {/* Kanban Board */}
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
