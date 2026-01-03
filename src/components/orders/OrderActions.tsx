"use client";

import { AlertCircle, XCircle } from "lucide-react";

export default function OrderActions() {
  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel this order?")) {
      console.log("Cancelling order...");
    }
  };

  return (
    <div className="flex gap-3">
      <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
        <AlertCircle size={16} />
        <span className="hidden sm:inline">Need Help?</span>
        <span className="sm:hidden">Help</span>
      </button>
      <button
        onClick={handleCancel}
        className="px-4 py-2 rounded-lg bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors flex items-center gap-2"
      >
        <XCircle size={16} />
        <span className="hidden sm:inline">Cancel Order</span>
        <span className="sm:hidden">Cancel</span>
      </button>
    </div>
  );
}
