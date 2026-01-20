"use client";

import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CancelOrderButtonProps {
  orderId: string;
  canCancel: boolean;
}

export default function CancelOrderButton({ orderId, canCancel }: CancelOrderButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.warning("Reason Required", "Please provide a reason for cancellation");
      return;
    }

    setIsCancelling(true);

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Order Cancelled", "Your order has been cancelled successfully");
        router.refresh();
        setIsOpen(false);
      } else {
        toast.error("Cancellation Failed", data.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Cancellation Error", "Failed to cancel order. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (!canCancel) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 rounded-lg bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors"
      >
        Cancel Order
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Cancel Order?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for cancellation
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please tell us why you're cancelling..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isCancelling}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
