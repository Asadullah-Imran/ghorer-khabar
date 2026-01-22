"use client";

import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Search, Eye, CheckCircle, AlertCircle } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  kitchen?: {
    id: string;
    name: string;
  };
}

export default function SupportPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/support");
      const data = await res.json();
      setNotifications(data.notifications);
      setFilteredNotifications(data.notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    applyFilters(value, typeFilter);
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type);
    applyFilters(search, type);
  };

  const applyFilters = (searchValue: string, type: string) => {
    let filtered = notifications;

    if (searchValue) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          n.message.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    if (type !== "ALL") {
      filtered = filtered.filter((n) => n.type === type);
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (res.ok) {
        setNotifications(
          notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setFilteredNotifications(
          filteredNotifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        if (selectedNotification?.id === notificationId) {
          setSelectedNotification({ ...selectedNotification, read: true });
        }
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "INFO":
        return <AlertCircle size={18} className="text-blue-400" />;
      case "SUCCESS":
        return <CheckCircle size={18} className="text-green-400" />;
      case "WARNING":
        return <AlertCircle size={18} className="text-yellow-400" />;
      case "ERROR":
        return <AlertCircle size={18} className="text-red-400" />;
      default:
        return <AlertCircle size={18} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "INFO":
        return "bg-blue-500/20 text-blue-400";
      case "SUCCESS":
        return "bg-green-500/20 text-green-400";
      case "WARNING":
        return "bg-yellow-500/20 text-yellow-400";
      case "ERROR":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading support tickets...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto flex flex-col">
      <AdminHeader title="Support & Notifications" />

      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold mb-2">Support Tickets</h2>
          <p className="text-text-muted">
            Manage user support requests and system notifications
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search by title or message..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-surface-dark bg-neutral-900 border border-border-dark rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => handleTypeFilter(e.target.value)}
            className="bg-surface-dark bg-neutral-900 border border-border-dark rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-white"
          >
            <option value="ALL">All Types</option>
            <option value="INFO">Info</option>
            <option value="SUCCESS">Success</option>
            <option value="WARNING">Warning</option>
            <option value="ERROR">Error</option>
          </select>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 bg-surface-dark border border-border-dark rounded-xl">
              <p className="text-text-muted text-lg">No support tickets found</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  notification.read
                    ? "bg-background-dark border-border-dark"
                    : "bg-surface-dark border-primary/50"
                }`}
                onClick={() => setSelectedNotification(notification)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-lg">{notification.title}</h3>
                        <p className="text-text-muted text-sm mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${getTypeColor(
                            notification.type
                          )}`}
                        >
                          {notification.type}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-text-muted mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface-dark border border-border-dark rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="pt-1">{getTypeIcon(selectedNotification.type)}</div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">
                      {selectedNotification.title}
                    </h2>
                    <p className="text-text-muted">
                      {new Date(selectedNotification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-text-muted hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Type Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded font-bold ${getTypeColor(
                    selectedNotification.type
                  )}`}
                >
                  {selectedNotification.type}
                </span>
                {!selectedNotification.read && (
                  <span className="px-3 py-1 rounded bg-primary/20 text-primary font-bold text-xs">
                    UNREAD
                  </span>
                )}
              </div>

              {/* Message */}
              <div className="bg-background-dark rounded-lg p-4">
                <p className="text-white leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>

              {/* Related Info */}
              {(selectedNotification.user || selectedNotification.kitchen) && (
                <div className="bg-background-dark rounded-lg p-4 space-y-3">
                  <h3 className="font-bold text-lg">Related Information</h3>
                  {selectedNotification.user && (
                    <div>
                      <p className="text-text-muted text-sm">User</p>
                      <p className="font-medium">{selectedNotification.user.name}</p>
                      <p className="text-sm text-text-muted">
                        {selectedNotification.user.email}
                      </p>
                    </div>
                  )}
                  {selectedNotification.kitchen && (
                    <div>
                      <p className="text-text-muted text-sm">Kitchen</p>
                      <p className="font-medium">{selectedNotification.kitchen.name}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              {!selectedNotification.read && (
                <button
                  onClick={() => {
                    markAsRead(selectedNotification.id);
                  }}
                  className="w-full px-4 py-3 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Mark as Read
                </button>
              )}
              <button
                onClick={() => setSelectedNotification(null)}
                className="w-full px-4 py-3 bg-border-dark text-white rounded-lg font-bold hover:bg-border-dark/80 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
