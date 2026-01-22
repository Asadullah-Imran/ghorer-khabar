"use client";

import AdminHeader from "@/components/admin/AdminHeader";
import { useToast } from "@/contexts/ToastContext";
import {
  CheckCircle,
  Eye,
  Search,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";

interface Kitchen {
  id: string;
  name: string;
  nidName: string;
  nidFrontImage?: string | null;
  nidBackImage?: string | null;
  isVerified: boolean;
  onboardingCompleted: boolean;
  isActive?: boolean;
  seller: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  totalOrders: number;
  totalRevenue: number;
}

export default function SellerOnboarding() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [filteredKitchens, setFilteredKitchens] = useState<Kitchen[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedKitchen, setSelectedKitchen] = useState<Kitchen | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [showSuspendInput, setShowSuspendInput] = useState(false);
  const [verificationFilter, setVerificationFilter] = useState<"pending" | "verified" | "all">("pending");
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setSkip(0);
    setKitchens([]);
    setFilteredKitchens([]);
    fetchKitchens(0);
  }, [verificationFilter]);

  const fetchKitchens = async (skipValue: number = 0) => {
    try {
      skipValue === 0 ? setLoading(true) : setLoadingMore(true);
      
      const isVerifiedParam = verificationFilter === "pending" ? "false" : verificationFilter === "verified" ? "true" : null;
      const query = new URLSearchParams({
        skip: skipValue.toString(),
        take: "10",
        ...(isVerifiedParam !== null && { isVerified: isVerifiedParam }),
      });

      const res = await fetch(`/api/admin/kitchens?${query}`);
      const data = await res.json();
      
      if (skipValue === 0) {
        setKitchens(data.kitchens);
        setFilteredKitchens(data.kitchens);
      } else {
        setKitchens((prev) => [...prev, ...data.kitchens]);
        setFilteredKitchens((prev) => [...prev, ...data.kitchens]);
      }
      
      setHasMore(data.hasMore);
      setSkip(skipValue + 10);
    } catch (error) {
      console.error("Failed to fetch kitchens:", error);
      toast.error("Failed to load kitchens");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    const filtered = kitchens.filter((k) =>
      k.name.toLowerCase().includes(value.toLowerCase()) ||
      k.seller.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredKitchens(filtered);
  };

  const handleApprove = async (kitchenId: string) => {
    try {
      const res = await fetch("/api/admin/kitchens", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kitchenId,
          isVerified: true,
          onboardingCompleted: true,
        }),
      });

      if (res.ok) {
        toast.success("Kitchen approved", "The seller kitchen has been approved and activated");
        setKitchens(
          kitchens.map((k) =>
            k.id === kitchenId
              ? { ...k, isVerified: true, onboardingCompleted: true }
              : k
          )
        );
        setFilteredKitchens(
          filteredKitchens.map((k) =>
            k.id === kitchenId
              ? { ...k, isVerified: true, onboardingCompleted: true }
              : k
          )
        );
        setSelectedKitchen(null);
      }
    } catch (error) {
      console.error("Failed to approve kitchen:", error);
      toast.error("Failed to approve kitchen");
    }
  };

  const handleReject = async (kitchenId: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsRejecting(true);
    try {
      const res = await fetch("/api/admin/kitchens", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kitchenId,
          isVerified: false,
          onboardingCompleted: false,
          action: "reject",
          reason: rejectionReason,
        }),
      });

      if (res.ok) {
        toast.success("Kitchen rejected", "The seller has been notified via email");
        setKitchens(kitchens.filter((k) => k.id !== kitchenId));
        setFilteredKitchens(filteredKitchens.filter((k) => k.id !== kitchenId));
        setSelectedKitchen(null);
        setRejectionReason("");
        setShowRejectInput(false);
      }
    } catch (error) {
      console.error("Failed to reject kitchen:", error);
      toast.error("Failed to reject kitchen");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleToggleActive = async (kitchenId: string, nextActive: boolean) => {
    setIsTogglingActive(true);
    try {
      const res = await fetch("/api/admin/kitchens", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kitchenId,
          isActive: nextActive,
        }),
      });

      if (res.ok) {
        setKitchens((prev) => prev.map((k) => (k.id === kitchenId ? { ...k, isActive: nextActive } : k)));
        setFilteredKitchens((prev) => prev.map((k) => (k.id === kitchenId ? { ...k, isActive: nextActive } : k)));
        setSelectedKitchen((prev) => (prev && prev.id === kitchenId ? { ...prev, isActive: nextActive } : prev));
        toast.success(
          nextActive ? "Kitchen activated" : "Kitchen deactivated",
          nextActive ? "Seller can now accept orders" : "Seller access has been paused"
        );
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to update kitchen status");
      }
    } catch (error) {
      console.error("Failed to toggle kitchen active state:", error);
      toast.error("Failed to update status", error instanceof Error ? error.message : "");
    } finally {
      setIsTogglingActive(false);
    }
  };

  const handleSuspendSeller = async (kitchenId: string) => {
    if (!suspensionReason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }

    setIsTogglingActive(true);
    try {
      const res = await fetch("/api/admin/kitchens", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kitchenId,
          isActive: false,
          isVerified: false,
          action: "suspend",
          reason: suspensionReason,
        }),
      });

      if (res.ok) {
        setKitchens((prev) => prev.map((k) => (k.id === kitchenId ? { ...k, isActive: false, isVerified: false } : k)));
        setFilteredKitchens((prev) => prev.map((k) => (k.id === kitchenId ? { ...k, isActive: false, isVerified: false } : k)));
        setSelectedKitchen((prev) => (prev && prev.id === kitchenId ? { ...prev, isActive: false, isVerified: false } : prev));
        toast.success("Seller suspended", "The seller has been notified via email");
        setSuspensionReason("");
        setShowSuspendInput(false);
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to suspend seller");
      }
    } catch (error) {
      console.error("Failed to suspend seller:", error);
      toast.error("Failed to suspend seller", error instanceof Error ? error.message : "");
    } finally {
      setIsTogglingActive(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading sellers...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto flex flex-col">
      <AdminHeader title="Seller Onboarding Verification" />

      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold mb-2">Verify Seller Applications</h2>
          <p className="text-text-muted">
            Review and approve new seller kitchen onboarding requests
          </p>
        </div>

        {/* Filter and Search */}
        <div className="flex gap-4 flex-col sm:flex-row sm:items-center">
          {/* Filter */}
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value as "pending" | "verified" | "all")}
            className="bg-neutral-900 border border-border-dark rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-white"
          >
            <option value="pending">Pending Verification</option>
            <option value="verified">Verified</option>
            <option value="all">See All</option>
          </select>

          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search by kitchen name or seller email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-surface-dark bg-neutral-900 border border-border-dark rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-white"
            />
          </div>
        </div>

        {/* Kitchen Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredKitchens.length === 0 ? (
            <div className="lg:col-span-2 text-center py-12 bg-surface-dark border border-border-dark rounded-xl">
              <p className="text-text-muted text-lg">No pending verification requests</p>
            </div>
          ) : (
            filteredKitchens.map((kitchen) => (
              <div
                key={kitchen.id}
                className="bg-surface-dark border border-border-dark rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedKitchen(kitchen)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold">{kitchen.name}</h3>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold ${
                      kitchen.isVerified
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {kitchen.isVerified ? "VERIFIED" : "PENDING"}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-text-muted text-xs uppercase mb-1">Seller</p>
                    <p className="font-medium">{kitchen.seller.name}</p>
                    <p className="text-sm text-text-muted">{kitchen.seller.email}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs uppercase mb-1">NID Name</p>
                    <p className="font-medium">{kitchen.nidName || "Not provided"}</p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedKitchen(kitchen);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium"
                >
                  <Eye size={16} /> View Details
                </button>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => fetchKitchens(skip)}
              disabled={loadingMore}
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? "Loading..." : `Load More (${filteredKitchens.length} loaded)`}
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedKitchen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface-dark border border-border-dark rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedKitchen.name}</h2>
                  <p className="text-text-muted">{selectedKitchen.seller.email}</p>
                </div>
                <button
                  onClick={() => setSelectedKitchen(null)}
                  className="text-text-muted hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Seller Information */}
              <div className="bg-background-dark rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-lg">Seller Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-muted text-sm">Name</p>
                    <p className="font-medium">{selectedKitchen.seller.name}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-sm">Email</p>
                    <p className="font-medium">{selectedKitchen.seller.email}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-sm">Joined</p>
                    <p className="font-medium">
                      {new Date(selectedKitchen.seller.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Kitchen Information */}
              <div className="bg-background-dark rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-lg">Kitchen Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-text-muted text-sm">NID Name</p>
                    <p className="font-medium">{selectedKitchen.nidName || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-sm">Verification Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedKitchen.isVerified ? (
                        <>
                          <CheckCircle size={18} className="text-green-400" />
                          <span className="text-green-400 font-medium">Verified</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={18} className="text-yellow-400" />
                          <span className="text-yellow-400 font-medium">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="bg-background-dark rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-lg">Documents</h3>
                <div className="space-y-3">
                  {selectedKitchen.nidName && (
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                      <span className="text-sm">NID Documents Submitted</span>
                      <CheckCircle size={18} className="text-green-400" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-background-dark border border-border-dark rounded-lg overflow-hidden">
                      <div className="px-3 py-2 text-xs uppercase text-text-muted">NID Front</div>
                      <div className="aspect-video bg-background-dark flex items-center justify-center">
                        {selectedKitchen.nidFrontImage ? (
                          <img
                            src={selectedKitchen.nidFrontImage}
                            alt="NID Front"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <p className="text-text-muted text-xs">Not uploaded</p>
                        )}
                      </div>
                    </div>
                    <div className="bg-background-dark border border-border-dark rounded-lg overflow-hidden">
                      <div className="px-3 py-2 text-xs uppercase text-text-muted">NID Back</div>
                      <div className="aspect-video bg-background-dark flex items-center justify-center">
                        {selectedKitchen.nidBackImage ? (
                          <img
                            src={selectedKitchen.nidBackImage}
                            alt="NID Back"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <p className="text-text-muted text-xs">Not uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-border-dark">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {!selectedKitchen.isVerified ? (
                    <>
                      <button
                        onClick={() => setShowRejectInput(!showRejectInput)}
                        disabled={isRejecting}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors font-bold disabled:opacity-50"
                      >
                        <XCircle size={18} /> Reject Application
                      </button>
                      <button
                        onClick={() => handleApprove(selectedKitchen.id)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors font-bold"
                      >
                        <CheckCircle size={18} /> Approve & Activate
                      </button>
                    </>
                  ) : (
                    <div className="md:col-span-2 text-center p-4 bg-green-500/10 rounded-lg">
                      <p className="text-green-400 font-medium">This kitchen has been approved and activated</p>
                    </div>
                  )}
                </div>

                {/* Rejection Reason Input */}
                {showRejectInput && !selectedKitchen.isVerified && (
                  <div className="bg-background-dark border border-border-dark rounded-lg p-4 space-y-3">
                    <label className="block text-sm font-medium text-text-muted">
                      Rejection Reason
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a detailed reason for rejection..."
                      className="w-full px-3 py-2 bg-neutral-900 border border-border-dark rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary resize-none"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(selectedKitchen.id)}
                        disabled={isRejecting || !rejectionReason.trim()}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRejecting ? "Sending..." : "Confirm Rejection"}
                      </button>
                      <button
                        onClick={() => {
                          setShowRejectInput(false);
                          setRejectionReason("");
                        }}
                        className="px-4 py-2 bg-surface-dark border border-border-dark text-text-primary rounded-lg hover:border-primary transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {selectedKitchen.isVerified && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        onClick={() => handleToggleActive(selectedKitchen.id, !(selectedKitchen.isActive ?? true))}
                        disabled={isTogglingActive}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-surface-dark border border-border-dark rounded-lg hover:border-primary transition-colors font-bold disabled:opacity-50"
                      >
                        {selectedKitchen.isActive === false ? "Activate Kitchen" : "Deactivate Kitchen"}
                      </button>

                      <button
                        onClick={() => setShowSuspendInput(!showSuspendInput)}
                        disabled={isTogglingActive}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors font-bold disabled:opacity-50"
                      >
                        Stop Seller Account
                      </button>
                    </div>

                    {/* Suspension Reason Input */}
                    {showSuspendInput && (
                      <div className="bg-background-dark border border-border-dark rounded-lg p-4 space-y-3">
                        <label className="block text-sm font-medium text-text-muted">
                          Suspension Reason
                        </label>
                        <textarea
                          value={suspensionReason}
                          onChange={(e) => setSuspensionReason(e.target.value)}
                          placeholder="Please provide a detailed reason for suspension..."
                          className="w-full px-3 py-2 bg-neutral-900 border border-border-dark rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary resize-none"
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSuspendSeller(selectedKitchen.id)}
                            disabled={isTogglingActive || !suspensionReason.trim()}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isTogglingActive ? "Suspending..." : "Confirm Suspension"}
                          </button>
                          <button
                            onClick={() => {
                              setShowSuspendInput(false);
                              setSuspensionReason("");
                            }}
                            className="px-4 py-2 bg-surface-dark border border-border-dark text-text-primary rounded-lg hover:border-primary transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
