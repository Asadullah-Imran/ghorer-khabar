"use client";

import { useAdminNotifications } from "@/contexts/AdminNotificationContext";
import { Bell, X, CheckCheck, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function AdminNotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useAdminNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sort notifications: unread first, then by newest
  const sortedNotifications = [...notifications].sort((a, b) => {
    // Unread notifications come first
    if (a.read !== b.read) {
      return a.read ? 1 : -1;
    }
    // Then sort by newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-muted hover:text-white hover:bg-surface-dark rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-background-dark border border-border-dark rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-dark">
            <div>
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-text-muted">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={32} className="mx-auto mb-2 text-text-muted opacity-50" />
                <p className="text-text-muted text-sm">No notifications yet</p>
              </div>
            ) : (
              sortedNotifications.map((notification) => (
                <Link 
                  key={notification.id} 
                  href={notification.type === "SELLER_APPROVAL" ? "/admin/onboarding" : "/admin/support"}
                >
                  <div
                    onClick={() => {
                      handleNotificationClick(notification.id);
                      setIsOpen(false);
                    }}
                    className={`p-4 border-b border-border-dark cursor-pointer transition-colors hover:bg-background-dark/60 ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Notification Badge */}
                      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                        !notification.read ? "bg-red-500" : "bg-transparent"
                      }`} />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          !notification.read ? "text-white" : "text-text-muted"
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-text-muted mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-text-muted mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          deleteNotification(notification.id);
                        }}
                        className="text-text-muted hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <Link href="/admin/support">
              <div
                onClick={() => setIsOpen(false)}
                className="p-3 text-center border-t border-border-dark text-primary text-sm font-medium hover:bg-background-dark/70 cursor-pointer transition-colors"
              >
                View all support tickets
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
