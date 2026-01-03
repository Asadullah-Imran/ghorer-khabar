"use client";

import {
  CheckCircle,
  ChevronRight,
  Clock,
  Package,
  Timer,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function OrderList({ orders }: { orders: any[] }) {
  const [filter, setFilter] = useState<"active" | "completed">("active");

  const filteredOrders = orders.filter((order) => order.status === filter);

  // Helper for Status Badge
  const getStatusBadge = (stage: string) => {
    switch (stage) {
      case "cooking":
      case "accepted":
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
            <Timer size={12} /> In Progress
          </span>
        );
      case "ready":
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-full">
            <Package size={12} /> Ready
          </span>
        );
      case "delivered":
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">
            <CheckCircle size={12} /> Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
            <XCircle size={12} /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setFilter("active")}
          className={`flex-1 pb-3 text-sm font-bold transition-colors border-b-2 ${
            filter === "active"
              ? "border-teal-600 text-teal-800"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Active Orders
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`flex-1 pb-3 text-sm font-bold transition-colors border-b-2 ${
            filter === "completed"
              ? "border-teal-600 text-teal-800"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Past Orders
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Package size={48} className="mx-auto mb-2 opacity-20" />
            <p>No {filter} orders found.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`} // Links to the Tracking Page
              className="group block bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:border-teal-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  {/* Overlapping Avatars for multi-kitchen */}
                  <div className="flex -space-x-2">
                    {order.images.map((img: string, i: number) => (
                      <div
                        key={i}
                        className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200"
                      >
                        <Image
                          src={img}
                          alt="Kitchen"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      {order.kitchens.join(" & ")}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {order.itemsSummary}
                    </p>
                  </div>
                </div>
                {getStatusBadge(order.stage)}
              </div>

              <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                <div className="flex flex-col text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {order.date}
                  </span>
                  <span className="font-bold text-gray-900 text-sm mt-0.5">
                    ৳{order.total}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-teal-700 text-xs font-bold group-hover:translate-x-1 transition-transform">
                  {filter === "active" ? "Track Order" : "View Details"}{" "}
                  <ChevronRight size={14} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
