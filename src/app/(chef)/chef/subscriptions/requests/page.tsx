"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useConfirmation } from "@/contexts/ConfirmationContext";
import { useToast } from "@/contexts/ToastContext";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Calendar,
  MapPin,
  Package,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

interface SubscriptionRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  userAvatar: string | null;
  planId: string;
  planName: string;
  planDescription: string | null;
  planPrice: number;
  planImage: string | null;
  mealsPerDay: number;
  servingsPerMeal: number;
  status: string;
  startDate: string;
  endDate: string | null;
  deliveryInstructions: string | null;
  useChefContainers: boolean;
  monthlyPrice: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  createdAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
}

export default function SubscriptionRequestsPage() {
  const { user } = useAuth();
  const { confirm, setLoading: setConfirmLoading } = useConfirmation();
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Fetch subscription requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?.kitchen?.id) {
        setError("Kitchen information not available");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/chef/subscriptions/requests");
        if (!response.ok) {
          throw new Error("Failed to fetch subscription requests");
        }
        const data = await response.json();

        if (data.success) {
          setRequests(data.data || []);
        } else {
          throw new Error(data.error || "Failed to fetch requests");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load requests";
        setError(message);
        console.error("Error fetching subscription requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user?.kitchen?.id]);

  const handleApprove = async (requestId: string, planName: string) => {
    const confirmed = await confirm({
      title: "Approve Subscription Request",
      message: `Are you sure you want to approve this subscription request for "${planName}"?`,
      confirmLabel: "Approve",
      variant: "info",
    });

    if (confirmed) {
      try {
        setConfirmLoading(true);
        const response = await fetch(
          `/api/chef/subscriptions/requests/${requestId}/approve`,
          {
            method: "PATCH",
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to approve subscription");
        }

        // Update local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? { ...req, status: "ACTIVE", confirmedAt: new Date().toISOString() }
              : req
          )
        );

        toast.success("Approved", "Subscription request approved successfully");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to approve";
        toast.error("Approval Failed", message);
      } finally {
        setConfirmLoading(false);
      }
    }
  };

  const handleReject = async (requestId: string, planName: string) => {
    const confirmed = await confirm({
      title: "Reject Subscription Request",
      message: `Are you sure you want to reject this subscription request for "${planName}"? You can optionally provide a reason.`,
      confirmLabel: "Reject",
      variant: "danger",
    });

    if (confirmed) {
      try {
        setConfirmLoading(true);
        const response = await fetch(
          `/api/chef/subscriptions/requests/${requestId}/reject`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reason: "Rejected by chef",
            }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to reject subscription");
        }

        // Update local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  status: "CANCELLED",
                  cancelledAt: new Date().toISOString(),
                }
              : req
          )
        );

        toast.success("Rejected", "Subscription request rejected");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to reject";
        toast.error("Rejection Failed", message);
      } finally {
        setConfirmLoading(false);
      }
    }
  };

  // Group requests by status
  const pendingRequests = requests.filter((req) => req.status === "PENDING");
  const activeRequests = requests.filter((req) => req.status === "ACTIVE");
  const cancelledRequests = requests.filter((req) => req.status === "CANCELLED");

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock size={48} className="mx-auto text-gray-400 mb-4 animate-spin" />
          <p className="text-gray-600">Loading subscription requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Data</h3>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900">
            Subscription Requests
          </h1>
          <p className="text-gray-500 mt-2">
            Review and manage subscription requests from customers.
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock size={24} className="text-yellow-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">
              Pending Requests
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {pendingRequests.length}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">
              Active Subscriptions
            </span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {activeRequests.length}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle size={24} className="text-red-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">
              Rejected/Cancelled
            </span>
          </div>
          <p className="text-3xl font-bold text-red-600">
            {cancelledRequests.length}
          </p>
        </div>
      </div>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pending Approval ({pendingRequests.length})
          </h2>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <SubscriptionRequestCard
                key={request.id}
                request={request}
                onApprove={() => handleApprove(request.id, request.planName)}
                onReject={() => handleReject(request.id, request.planName)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Active Subscriptions Section */}
      {activeRequests.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Active Subscriptions ({activeRequests.length})
          </h2>
          <div className="space-y-4">
            {activeRequests.map((request) => (
              <SubscriptionRequestCard
                key={request.id}
                request={request}
                readOnly={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Cancelled/Rejected Section */}
      {cancelledRequests.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Rejected/Cancelled ({cancelledRequests.length})
          </h2>
          <div className="space-y-4">
            {cancelledRequests.map((request) => (
              <SubscriptionRequestCard
                key={request.id}
                request={request}
                readOnly={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {requests.length === 0 && !loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Subscription Requests
          </h3>
          <p className="text-gray-600">
            You don't have any subscription requests yet. When customers subscribe
            to your plans, they will appear here.
          </p>
        </div>
      )}
    </div>
  );
}

interface SubscriptionRequestCardProps {
  request: SubscriptionRequest;
  onApprove?: () => void;
  onReject?: () => void;
  readOnly?: boolean;
}

function SubscriptionRequestCard({
  request,
  onApprove,
  onReject,
  readOnly = false,
}: SubscriptionRequestCardProps) {
  const getStatusBadge = () => {
    switch (request.status) {
      case "PENDING":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
            Pending
          </span>
        );
      case "ACTIVE":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
            Active
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Plan Image */}
        <div className="relative w-full md:w-48 h-32 md:h-48 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={request.planImage || "/placeholder-plan.jpg"}
            alt={request.planName}
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {request.planName}
              </h3>
              {request.planDescription && (
                <p className="text-sm text-gray-600 mt-1">
                  {request.planDescription}
                </p>
              )}
            </div>
            {getStatusBadge()}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              {request.userAvatar ? (
                <Image
                  src={request.userAvatar}
                  alt={request.userName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <User size={20} className="text-gray-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{request.userName}</p>
              <p className="text-xs text-gray-500">{request.userEmail}</p>
              {request.userPhone && (
                <p className="text-xs text-gray-500">{request.userPhone}</p>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(request.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Meals/Day</p>
                <p className="font-semibold text-gray-900">
                  {request.mealsPerDay}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Monthly Price</p>
                <p className="font-semibold text-gray-900">
                  ৳{request.monthlyPrice.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="font-semibold text-gray-900">
                  ৳{request.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Instructions */}
          {request.deliveryInstructions && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <MessageSquare size={16} className="text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-900">
                  Delivery Instructions:
                </p>
                <p className="text-sm text-blue-800">
                  {request.deliveryInstructions}
                </p>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>
              Uses Chef Containers:{" "}
              {request.useChefContainers ? "Yes" : "No"}
            </span>
            <span>
              Requested: {new Date(request.createdAt).toLocaleDateString()}
            </span>
            {request.confirmedAt && (
              <span>
                Approved: {new Date(request.confirmedAt).toLocaleDateString()}
              </span>
            )}
            {request.cancelledAt && (
              <span>
                Rejected: {new Date(request.cancelledAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          {!readOnly && request.status === "PENDING" && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={onApprove}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Approve
              </button>
              <button
                onClick={onReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <XCircle size={18} />
                Reject
              </button>
            </div>
          )}

          {/* Cancellation Reason */}
          {request.cancellationReason && (
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-xs font-semibold text-red-900">Reason:</p>
              <p className="text-sm text-red-800">{request.cancellationReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
