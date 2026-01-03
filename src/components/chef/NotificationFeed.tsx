"use client";

import {
  AlertCircle,
  Bell,
  CheckCircle,
  Clock,
  Info,
  X,
} from "lucide-react";
import { useState } from "react";

type NotificationType = "info" | "success" | "warning" | "error";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationFeedProps {
  notifications?: Notification[];
  maxHeight?: string;
  onDismiss?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
}

const defaultNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Order Completed",
    message: "Order #1024 has been successfully delivered",
    timestamp: new Date(Date.now() - 10 * 60000), // 10 min ago
    read: false,
  },
  {
    id: "2",
    type: "info",
    title: "New Order Received",
    message: "New order from Sadia Rahman for ৳450",
    timestamp: new Date(Date.now() - 25 * 60000), // 25 min ago
    read: false,
  },
  {
    id: "3",
    type: "warning",
    title: "Low Inventory",
    message: "Your Beef Bhuna stock is running low",
    timestamp: new Date(Date.now() - 1 * 3600000), // 1 hour ago
    read: true,
  },
  {
    id: "4",
    type: "success",
    title: "Payment Received",
    message: "৳2,450 credited to your account",
    timestamp: new Date(Date.now() - 2 * 3600000), // 2 hours ago
    read: true,
  },
  {
    id: "5",
    type: "info",
    title: "Review Added",
    message: "Rahim K. left a 5-star review: 'Tastes exactly like my mom's cooking'",
    timestamp: new Date(Date.now() - 4 * 3600000), // 4 hours ago
    read: true,
  },
  {
    id: "6",
    type: "error",
    title: "Order Cancelled",
    message: "Order #1019 was cancelled by customer",
    timestamp: new Date(Date.now() - 6 * 3600000), // 6 hours ago
    read: true,
  },
];

const notificationConfig = {
  info: {
    icon: Info,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
    dotColor: "bg-blue-500",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-800",
    dotColor: "bg-green-500",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-800",
    dotColor: "bg-yellow-500",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-800",
    dotColor: "bg-red-500",
  },
};

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationFeed({
  notifications = defaultNotifications,
  maxHeight = "max-h-96",
  onDismiss,
  onMarkAsRead,
}: NotificationFeedProps) {
  const [items, setItems] = useState(notifications);

  const handleDismiss = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    onDismiss?.(id);
  };

  const handleMarkAsRead = (id: string) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    onMarkAsRead?.(id);
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-teal-600" />
          <h3 className="text-lg font-bold text-gray-900">
            Recent Alerts
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
        </div>
      </div>

      {/* Notifications List */}
      <div className={`${maxHeight} overflow-y-auto space-y-3`}>
        {items.length > 0 ? (
          items.map((notification) => {
            const config = notificationConfig[notification.type];
            const Icon = config.icon;

            return (
              <div
                key={notification.id}
                className={`relative ${config.bgColor} border ${config.borderColor} rounded-lg p-4 transition hover:shadow-md ${
                  !notification.read ? "ring-1 ring-offset-1 ring-teal-300" : ""
                }`}
              >
                {/* Unread Indicator */}
                {!notification.read && (
                  <div className="absolute top-3 right-3">
                    <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                  </div>
                )}

                {/* Content */}
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 mt-0.5 ${config.textColor}`}>
                    <Icon size={20} />
                  </div>

                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm ${config.textColor}`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-700 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/50">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{formatTime(notification.timestamp)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs font-medium text-teal-600 hover:text-teal-700 transition"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => handleDismiss(notification.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition"
                          title="Dismiss"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell size={32} className="text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No notifications yet</p>
            <p className="text-sm text-gray-400">
              You&apos;ll get alerts about orders, inventory, and updates here
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="w-full py-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition">
            View All Notifications →
          </button>
        </div>
      )}
    </div>
  );
}
