"use client";

import { useToast } from "@/contexts/ToastContext";
import { PauseCircle, XCircle } from "lucide-react";

export default function SubscriptionSettings() {
  const toast = useToast();
  const handlePause = () =>
    toast.info("Coming Soon", "Pause feature will be available soon!");
  const handleCancel = () =>
    toast.info("Coming Soon", "Cancel feature will be available soon!");

  return (
    <div className="pt-8 border-t border-gray-200">
      <h3 className="font-bold text-gray-900 mb-4">Subscription Settings</h3>
      <div className="flex flex-col gap-3">
        <button
          onClick={handlePause}
          className="flex items-center gap-3 w-full p-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-left transition-colors group"
        >
          <div className="bg-gray-100 p-2 rounded-lg text-gray-600 group-hover:text-gray-900">
            <PauseCircle size={20} />
          </div>
          <div>
            <span className="block font-bold text-gray-900">
              Pause Subscription
            </span>
            <span className="text-xs text-gray-500">
              Temporarily stop deliveries (e.g., for vacation)
            </span>
          </div>
        </button>

        <button
          onClick={handleCancel}
          className="flex items-center gap-3 w-full p-4 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 text-left transition-colors group"
        >
          <div className="bg-white p-2 rounded-lg text-red-500 group-hover:text-red-600">
            <XCircle size={20} />
          </div>
          <div>
            <span className="block font-bold text-red-600">
              Cancel Subscription
            </span>
            <span className="text-xs text-red-400">
              Stop renewal at the end of billing cycle
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
