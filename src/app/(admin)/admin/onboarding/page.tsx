"use client";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
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
  isVerified: boolean;
  onboardingCompleted: boolean;
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
  const toast = useToast();

  useEffect(() => {
    fetchKitchens();
  }, []);

  const fetchKitchens = async () => {
    try {
      const res = await fetch("/api/admin/kitchens?onboardingCompleted=false");
      const data = await res.json();
      setKitchens(data.kitchens);
      setFilteredKitchens(data.kitchens);
    } catch (error) {
      console.error("Failed to fetch kitchens:", error);
    } finally {
      setLoading(false);
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
    }
  };

  const handleReject = async (kitchenId: string) => {
    // You can implement rejection logic here
    toast.info("Coming Soon", "Rejection logic can be implemented with email notification");
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-background-dark">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-muted">Loading sellers...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white">
      <AdminSidebar />

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

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search by kitchen name or seller email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-surface-dark border border-border-dark rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-white"
            />
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
                  <div className="space-y-2">
                    {selectedKitchen.nidName && (
                      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                        <span className="text-sm">NID Documents Submitted</span>
                        <CheckCircle size={18} className="text-green-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {!selectedKitchen.isVerified && (
                  <div className="flex gap-3 pt-4 border-t border-border-dark">
                    <button
                      onClick={() => handleReject(selectedKitchen.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors font-bold"
                    >
                      <XCircle size={18} /> Reject Application
                    </button>
                    <button
                      onClick={() => handleApprove(selectedKitchen.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors font-bold"
                    >
                      <CheckCircle size={18} /> Approve & Activate
                    </button>
                  </div>
                )}
                {selectedKitchen.isVerified && (
                  <div className="text-center p-4 bg-green-500/10 rounded-lg">
                    <p className="text-green-400 font-medium">This kitchen has been approved and activated</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
