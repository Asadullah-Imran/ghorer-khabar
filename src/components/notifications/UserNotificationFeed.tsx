"use client";

import {
  AlertCircle,
  Bell,
  CheckCircle,
  Clock,
  Info,
  X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

type NotificationType = "info" | "success" | "warning" | "error";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date | string;
  read: boolean;
}

interface UserNotificationFeedProps {
  notifications?: Notification[];
  onDismiss?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
}

const defaultNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Order Received",
    message: "Your order has been received by the chef",
    timestamp: new Date(Date.now() - 10 * 60000),
    read: false,
  },
  {
    id: "2",
    type: "info",
    title: "Order Update",
    message: "Your order is being prepared",
    timestamp: new Date(Date.now() - 25 * 60000),
    read: false,
  },
  {
    id: "3",
    type: "success",
    title: "Order Ready",
    message: "Your order is ready for pickup",
    timestamp: new Date(Date.now() - 1 * 3600000),
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

function formatTime(date: Date | string): string {
  const now = new Date();
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return dateObj.toLocaleDateString();
}

export default function UserNotificationFeed({
  notifications = defaultNotifications,
  onDismiss,
  onMarkAsRead,
}: UserNotificationFeedProps) {
  const [items, setItems] = useState(notifications);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
  const localChangesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setItems((currentItems) => {
      const currentMap = new Map(currentItems.map((item) => [item.id, item]));

      return notifications.map((notif) => {
        const currentItem = currentMap.get(notif.id);
        if (localChangesRef.current.has(notif.id) && currentItem?.read && !notif.read) {
          return currentItem;
        }
        if (notif.read && localChangesRef.current.has(notif.id)) {
          localChangesRef.current.delete(notif.id);
        }
        return notif;
      });
    });
  }, [notifications]);

  const handleDismiss = async (id: string) => {
    try {
      const response = await fetch(`/api/user/notifications?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setItems(items.filter((item) => item.id !== id));
        onDismiss?.(id);
      } else {
        console.error("Failed to dismiss notification");
      }
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    localChangesRef.current.add(id);
    setMarkingAsRead(id);

    try {
      const response = await fetch("/api/user/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notificationId: id }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onMarkAsRead?.(id);
        } else {
          setItems((currentItems) =>
            currentItems.map((item) => (item.id === id ? { ...item, read: false } : item))
          );
          localChangesRef.current.delete(id);
        }
      } else {
        const errorData = await response.json();
        console.error("Failed to mark as read:", errorData);
        setItems((currentItems) =>
          currentItems.map((item) => (item.id === id ? { ...item, read: false } : item))
        );
        localChangesRef.current.delete(id);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setItems((currentItems) =>
        currentItems.map((item) => (item.id === id ? { ...item, read: false } : item))
      );
      localChangesRef.current.delete(id);
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = items.filter((n) => !n.read);
    if (unreadNotifications.length === 0) return;

    // Optimistically update all unread items
    setItems((currentItems) =>
      currentItems.map((item) => ({ ...item, read: true }))
    );
    setIsMarkingAllAsRead(true);

    try {
      const response = await fetch("/api/user/notifications/mark-all-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Success - all marked as read
        } else {
          // Revert on error
          setItems(notifications);
        }
      } else {
        console.error("Failed to mark all as read");
        // Revert on error
        setItems(notifications);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      // Revert on error
      setItems(notifications);
    } finally {
      setIsMarkingAllAsRead(false);
    }
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-teal-600" />
          <h3 className="text-lg font-bold text-gray-900">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto space-y-3">
        {items.length > 0 ? (
          items.map((notification) => {
            const config = notificationConfig[notification.type];
            const Icon = config.icon;

            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`relative ${config.bgColor} border ${config.borderColor} rounded-lg p-4 transition hover:shadow-md cursor-pointer ${
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
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markingAsRead === notification.id}
                            className="text-xs font-medium text-teal-600 hover:text-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {markingAsRead === notification.id ? "Marking..." : "Mark as read"}
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
              You&apos;ll get alerts about orders, deliveries, and updates here
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && items.some((n) => !n.read) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllAsRead}
            className="w-full py-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isMarkingAllAsRead ? (
              <>
                <div className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                Marking all as read...
              </>
            ) : (
              "Mark all as read"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
