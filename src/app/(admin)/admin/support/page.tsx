"use client";

import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Search, Eye, CheckCircle, AlertCircle, Mail, X } from "lucide-react";

interface Ticket {
  id: string;
  topic: string;
  orderNumber: string | null;
  message: string;
  status: string;
  adminReply: string | null;
  resolvedAt: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [adminReply, setAdminReply] = useState("");
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/admin/support/tickets");
      const data = await res.json();
      setTickets(data.tickets);
      setFilteredTickets(data.tickets);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    applyFilters(value, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    applyFilters(search, status);
  };

  const applyFilters = (searchValue: string, status: string) => {
    let filtered = tickets;

    if (searchValue) {
      filtered = filtered.filter(
        (t) =>
          t.topic.toLowerCase().includes(searchValue.toLowerCase()) ||
          t.message.toLowerCase().includes(searchValue.toLowerCase()) ||
          (t.orderNumber && t.orderNumber.toLowerCase().includes(searchValue.toLowerCase())) ||
          (t.user?.email && t.user.email.toLowerCase().includes(searchValue.toLowerCase()))
      );
    }

    if (status !== "ALL") {
      filtered = filtered.filter((t) => t.status === status);
    }

    setFilteredTickets(filtered);
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket || !adminReply.trim()) {
      alert("Please enter a response message");
      return;
    }

    setResolving(true);
    try {
      const res = await fetch("/api/admin/support/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          status: "RESOLVED",
          adminReply: adminReply.trim(),
          resolvedBy: "admin", // You can replace with actual admin user ID
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Update local state
        setTickets(
          tickets.map((t) =>
            t.id === selectedTicket.id
              ? { ...t, status: "RESOLVED", adminReply: adminReply.trim(), resolvedAt: new Date().toISOString() }
              : t
          )
        );
        setFilteredTickets(
          filteredTickets.map((t) =>
            t.id === selectedTicket.id
              ? { ...t, status: "RESOLVED", adminReply: adminReply.trim(), resolvedAt: new Date().toISOString() }
              : t
          )
        );
        setSelectedTicket(null);
        setAdminReply("");
        alert(data.message || "Ticket resolved and email sent!");
      } else {
        alert(data.error || "Failed to resolve ticket");
      }
    } catch (error) {
      console.error("Failed to resolve ticket:", error);
      alert("Failed to resolve ticket");
    } finally {
      setResolving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-yellow-500/20 text-yellow-400";
      case "IN_PROGRESS":
        return "bg-blue-500/20 text-blue-400";
      case "RESOLVED":
        return "bg-green-500/20 text-green-400";
      case "CLOSED":
        return "bg-gray-500/20 text-gray-400";
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
      <AdminHeader title="Support Tickets" />

      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold mb-2">Support Tickets</h2>
          <p className="text-text-muted">
            Manage user support requests and resolve issues
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search by topic, message, order number, or email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-surface-dark bg-neutral-900 border border-border-dark rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="bg-surface-dark bg-neutral-900 border border-border-dark rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-white"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Tickets List */}
        <div className="space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 bg-surface-dark border border-border-dark rounded-xl">
              <p className="text-text-muted text-lg">No support tickets found</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  ticket.status === "OPEN"
                    ? "bg-surface-dark border-yellow-500/50"
                    : "bg-background-dark border-border-dark"
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <AlertCircle size={18} className="text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{ticket.topic}</h3>
                          {ticket.orderNumber && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-mono">
                              {ticket.orderNumber.substring(0, 12)}...
                            </span>
                          )}
                        </div>
                        <p className="text-text-muted text-sm mt-1 line-clamp-2">
                          {ticket.message}
                        </p>
                        {ticket.user && (
                          <p className="text-xs text-text-muted mt-2">
                            From: {ticket.user.name || "Guest"} ({ticket.user.email})
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted mt-2">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-border-dark rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{selectedTicket.topic}</h2>
                    <span
                      className={`px-3 py-1 rounded font-bold text-sm ${getStatusColor(
                        selectedTicket.status
                      )}`}
                    >
                      {selectedTicket.status}
                    </span>
                  </div>
                  <p className="text-text-muted text-sm">
                    Submitted on {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTicket(null);
                    setAdminReply("");
                  }}
                  className="text-text-muted hover:text-white text-2xl"
                >
                  <X size={24} />
                </button>
              </div>

              {/* User Info */}
              {selectedTicket.user && (
                <div className="bg-background-dark rounded-lg p-4">
                  <h3 className="font-bold text-sm text-text-muted mb-2">CUSTOMER INFORMATION</h3>
                  <div className="space-y-1">
                    <p className="font-medium">{selectedTicket.user.name || "Guest User"}</p>
                    <p className="text-sm text-text-muted">{selectedTicket.user.email}</p>
                    {selectedTicket.orderNumber && (
                      <p className="text-sm text-blue-400 font-mono mt-2">
                        Order: {selectedTicket.orderNumber}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Original Message */}
              <div className="bg-background-dark rounded-lg p-4">
                <h3 className="font-bold text-sm text-text-muted mb-3">CUSTOMER MESSAGE</h3>
                <p className="text-white leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.message}
                </p>
              </div>

              {/* Admin Reply (if exists) */}
              {selectedTicket.adminReply && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={16} className="text-green-400" />
                    <h3 className="font-bold text-sm text-green-400">ADMIN RESPONSE</h3>
                  </div>
                  <p className="text-white leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.adminReply}
                  </p>
                  {selectedTicket.resolvedAt && (
                    <p className="text-xs text-text-muted mt-2">
                      Resolved on {new Date(selectedTicket.resolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Reply Form (if not resolved) */}
              {selectedTicket.status !== "RESOLVED" && selectedTicket.status !== "CLOSED" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-text-muted mb-2">
                      ADMIN RESPONSE
                    </label>
                    <textarea
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                      rows={6}
                      placeholder="Type your response to the customer here..."
                      className="w-full px-4 py-3 rounded-lg bg-background-dark border border-border-dark text-white focus:ring-2 focus:ring-primary outline-none resize-none"
                    />
                    <p className="text-xs text-text-muted mt-2">
                      This response will be sent to the customer via email
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleResolveTicket}
                      disabled={resolving || !adminReply.trim()}
                      className="flex-1 px-4 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resolving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail size={18} /> Resolve & Send Email
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setAdminReply("");
                }}
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
