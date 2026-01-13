"use client";

import { Store } from "lucide-react";

interface KitchenNameStepProps {
  kitchenName: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function KitchenNameStep({
  kitchenName,
  onChange,
  error,
}: KitchenNameStepProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="bg-[#477e77]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store className="text-[#477e77]" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-[#1b0e0e]">Name Your Kitchen</h2>
        <p className="text-gray-600">
          Choose a memorable name for your home kitchen
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="kitchenName"
          className="block text-sm font-medium text-gray-700"
        >
          Kitchen Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="kitchenName"
          value={kitchenName}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., Mom's Kitchen, Spice Garden, Home Chef Delights"
          className={`
            w-full px-4 py-3 rounded-lg border-2 transition-colors
            focus:outline-none focus:ring-2 focus:ring-[#477e77]/20
            ${
              error
                ? "border-red-500"
                : "border-gray-200 focus:border-[#477e77]"
            }
          `}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="bg-[#feb728]/10 border border-[#feb728]/30 rounded-lg p-4">
        <h3 className="font-semibold text-sm text-[#1b0e0e] mb-2">
          💡 Tips for a great name:
        </h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Keep it simple and memorable</li>
          <li>• Reflect your cooking style or specialty</li>
          <li>• Make it personal and authentic</li>
        </ul>
      </div>
    </div>
  );
}
