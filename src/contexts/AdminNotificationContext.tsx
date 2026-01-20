"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

interface AdminNotification {
  id: string;
  supportTicketId: string;
  title: string;
  message: string;
  read: boolean;
  type: "SUPPORT_TICKET" | "SELLER_APPROVAL";
  createdAt: string;
}

interface AdminNotificationContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user || role !== "ADMIN") return;

    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [user, role]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistically mark as read so UI updates even before the API returns.
    setNotifications((prev) => {
      let wasUnread = false;
      const updated = prev.map((n) => {
        if (n.id === notificationId && !n.read) {
          wasUnread = true;
          return { ...n, read: true };
        }
        return n;
      });
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      return updated;
    });

    try {
      await fetch(`/api/admin/notifications/${notificationId}`, {
        method: "PATCH",
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications/mark-all-read", {
        method: "PATCH",
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }, []);

  // Initial fetch and setup polling
  useEffect(() => {
    if (user && role === "ADMIN") {
      fetchNotifications();

      // Poll for new notifications every 10 seconds
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user, role, fetchNotifications]);

  return (
    <AdminNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </AdminNotificationContext.Provider>
  );
}

export function useAdminNotifications() {
  const context = useContext(AdminNotificationContext);
  if (context === undefined) {
    throw new Error("useAdminNotifications must be used within AdminNotificationProvider");
  }
  return context;
}
