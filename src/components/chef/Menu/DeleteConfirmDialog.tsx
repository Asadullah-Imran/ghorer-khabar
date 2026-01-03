"use client";

import { MenuItem } from "@/lib/dummy-data/chef";
import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmDialogProps {
  item: MenuItem;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({
  item,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header with danger background */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-full">
              <AlertTriangle size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">Delete Menu Item?</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-3">
              You are about to delete:
            </p>
            <div className="bg-white p-3 rounded border border-red-100">
              <h3 className="font-bold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{item.category}</p>
              <p className="text-sm text-gray-500 mt-2">
                Current Price: <span className="font-semibold text-teal-600">৳{item.currentPrice}</span>
              </p>
              {item.ingredients && item.ingredients.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Ingredients: <span className="font-semibold">{item.ingredients.length}</span>
                </p>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">⚠️ Warning:</span> This action cannot be undone. The menu item will be permanently deleted.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            Keep Item
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <AlertTriangle size={18} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
