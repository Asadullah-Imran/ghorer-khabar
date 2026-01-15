"use client";

import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OperatingDay {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export default function SettingsPage() {
  const router = useRouter();

  // General Information State
  const [kitchenName, setKitchenName] = useState("");
  const [address, setAddress] = useState("");
  const [ownerName, setOwnerName] = useState(""); // Read-only
  const [phoneNumber, setPhoneNumber] = useState(""); // Read-only

  // Operating Hours State
  const [operatingHours, setOperatingHours] = useState<OperatingDay[]>([
    { day: "MONDAY", isOpen: true, openTime: "10:00", closeTime: "22:00" },
    { day: "TUESDAY", isOpen: true, openTime: "10:00", closeTime: "22:00" },
    { day: "WEDNESDAY", isOpen: true, openTime: "10:00", closeTime: "22:00" },
    { day: "THURSDAY", isOpen: true, openTime: "10:00", closeTime: "22:00" },
    { day: "FRIDAY", isOpen: true, openTime: "10:00", closeTime: "23:00" },
    { day: "SATURDAY", isOpen: true, openTime: "09:00", closeTime: "23:00" },
    { day: "SUNDAY", isOpen: false, openTime: "10:00", closeTime: "22:00" },
  ]);

  // Legal & Verification (Read-only)
  const [verificationStatus, setVerificationStatus] = useState<"verified" | "pending" | "rejected">("pending");
  const [nidNumber, setNidNumber] = useState("");

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Delete confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/chef/settings");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch settings");
      }

      if (result.success && result.data) {
        const { data } = result;
        setKitchenName(data.kitchenName || "");
        setAddress(data.address || "");
        setOwnerName(data.ownerName || "");
        setPhoneNumber(data.phoneNumber || "");
        setNidNumber(data.nidNumber || "");
        setVerificationStatus(data.isVerified ? "verified" : "pending");

        // Parse operating days
        if (data.operatingDays && typeof data.operatingDays === "object") {
          const parsedHours = Object.entries(data.operatingDays).map(([day, hours]) => ({
            day: day.toUpperCase(),
            isOpen: (hours as { isOpen?: boolean }).isOpen || false,
            openTime: (hours as { openTime?: string }).openTime || "10:00",
            closeTime: (hours as { closeTime?: string }).closeTime || "22:00",
          }));
          if (parsedHours.length > 0) {
            setOperatingHours(parsedHours);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      // Validation
      if (!kitchenName.trim()) {
        setError("Kitchen name is required");
        return;
      }
      if (!address.trim()) {
        setError("Address is required");
        return;
      }

      const response = await fetch("/api/chef/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kitchenName: kitchenName.trim(),
          address: address.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save settings");
      }

      setSuccessMessage("General information saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error saving general settings:", err);
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleDayOpen = (index: number) => {
    const updated = [...operatingHours];
    updated[index].isOpen = !updated[index].isOpen;
    setOperatingHours(updated);
  };

  const updateTime = (
    index: number,
    field: "openTime" | "closeTime",
    value: string
  ) => {
    const updated = [...operatingHours];
    updated[index][field] = value;
    setOperatingHours(updated);
  };

  const handleSaveHours = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      // Convert operating hours to the format expected by the backend
      const operatingDaysObj = operatingHours.reduce((acc, day) => {
        acc[day.day] = {
          isOpen: day.isOpen,
          openTime: day.openTime,
          closeTime: day.closeTime,
        };
        return acc;
      }, {} as Record<string, { isOpen: boolean; openTime: string; closeTime: string }>);

      const response = await fetch("/api/chef/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kitchenName,
          address,
          operatingDays: operatingDaysObj,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save operating hours");
      }

      setSuccessMessage("Operating hours saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error saving operating hours:", err);
      setError(err instanceof Error ? err.message : "Failed to save operating hours");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Validate that user typed the correct kitchen name
    if (deleteConfirmText.trim() !== kitchenName.trim()) {
      setError("Kitchen name does not match. Please type the exact kitchen name to confirm deletion.");
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const response = await fetch("/api/chef/delete-account", {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete account");
      }

      alert("Your account has been permanently deleted. You will now be logged out.");
      
      // Clear any local storage auth data
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Small delay to ensure cookies are set on client before redirect
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900">Business Settings</h1>
        <p className="text-gray-500 mt-2">
          Manage your kitchen profile, hours, and legal details.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg flex items-start gap-2">
          <CheckCircle2 className="flex-shrink-0 mt-0.5" size={18} />
          <p className="text-sm">{successMessage}</p>
        </div>
      )}

      {/* Section 1: General Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="text-yellow-500" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">
            General Information
          </h2>
        </div>

        <div className="space-y-4">
          {/* Kitchen Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kitchen Name *
            </label>
            <input
              type="text"
              value={kitchenName}
              onChange={(e) => setKitchenName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              placeholder="Enter your kitchen name"
            />
          </div>

          {/* Address */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MapPin size={16} />
              Address *
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none"
              rows={3}
              placeholder="Enter your complete address"
            />
          </div>

          {/* Owner Name (Read-only) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <User size={16} />
              Owner Full Name
            </label>
            <input
              type="text"
              value={ownerName}
              disabled
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Contact support to update owner name
            </p>
          </div>

          {/* Phone Number (Read-only) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Phone size={16} />
              Phone Number
            </label>
            <input
              type="text"
              value={phoneNumber}
              disabled
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Contact support to update phone number
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveGeneral}
            disabled={saving}
            className="w-full md:w-auto px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Section 2: Operating Hours */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="text-teal-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">
            Opening & Closing Hours
          </h2>
        </div>

        <div className="space-y-3">
          {operatingHours.map((day, index) => (
            <div
              key={day.day}
              className="flex flex-col md:flex-row md:items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Day Name */}
              <div className="flex-shrink-0 w-32">
                <span className="font-semibold text-gray-900">
                  {day.day.charAt(0) + day.day.slice(1).toLowerCase()}
                </span>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleDayOpen(index)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    day.isOpen ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      day.isOpen ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm font-semibold text-gray-700">
                  {day.isOpen ? "Open" : "Closed"}
                </span>
              </div>

              {/* Time Inputs */}
              {day.isOpen ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={day.openTime}
                    onChange={(e) =>
                      updateTime(index, "openTime", e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 text-sm font-semibold"
                  />
                  <span className="text-gray-600 font-semibold">to</span>
                  <input
                    type="time"
                    value={day.closeTime}
                    onChange={(e) =>
                      updateTime(index, "closeTime", e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 text-sm font-semibold"
                  />
                </div>
              ) : (
                <div className="flex-1 text-sm text-gray-500">
                  Kitchen is closed on this day
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveHours}
          disabled={saving}
          className="mt-6 w-full md:w-auto px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={20} />
          {saving ? "Saving..." : "Save Operating Hours"}
        </button>
      </div>

      {/* Section 3: Legal & Verification */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="text-teal-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">
            Legal & Verification
          </h2>
        </div>

        {/* Verification Status Badge */}
        <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-teal-100 border-2 border-teal-300 rounded-lg">
          <div className="flex items-center gap-3">
            {verificationStatus === "verified" && (
              <>
                <CheckCircle2 className="text-green-600" size={32} />
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    Verified Kitchen
                  </p>
                  <p className="text-sm text-gray-600">
                    Your kitchen has been verified by our team
                  </p>
                </div>
              </>
            )}
            {verificationStatus === "pending" && (
              <>
                <AlertTriangle className="text-orange-500" size={32} />
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    Verification Pending
                  </p>
                  <p className="text-sm text-gray-600">
                    Your documents are under review
                  </p>
                </div>
              </>
            )}
            {verificationStatus === "rejected" && (
              <>
                <XCircle className="text-red-600" size={32} />
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    Verification Rejected
                  </p>
                  <p className="text-sm text-gray-600">
                    Please contact support for more details
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* NID Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              NID Number (Masked for Security)
            </label>
            <input
              type="text"
              value={nidNumber}
              disabled
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Only the last 4 digits are shown for security purposes
            </p>
          </div>

          {/* Helper Text */}
          <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertTriangle
              className="text-blue-600 flex-shrink-0 mt-0.5"
              size={18}
            />
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> To update your NID or submit new
              verification documents, please contact our support team at{" "}
              <a href="mailto:support@ghorerkhabar.com" className="underline">
                support@ghorerkhabar.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Danger Zone */}
      <div className="bg-white rounded-xl border-2 border-red-300 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-red-600" size={24} />
          <h2 className="text-2xl font-bold text-red-600">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 mb-1">
              Delete Kitchen Account
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Permanently delete your kitchen account and all associated data.
              This action cannot be undone. All orders, menu items, and customer
              data will be permanently removed.
            </p>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition shadow-md flex items-center gap-2"
            >
              <Trash2 size={20} />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="bg-red-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center gap-3">
                <AlertTriangle size={32} />
                <div>
                  <h2 className="text-2xl font-bold">Delete Account</h2>
                  <p className="text-red-100 mt-1">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Dialog Content */}
            <div className="p-6 space-y-6">
              {/* Warning Message */}
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <p className="text-red-900 font-semibold text-lg mb-2">
                  ⚠️ Permanent Deletion Warning
                </p>
                <p className="text-red-800 text-sm">
                  This will permanently and irreversibly delete all your data from our system.
                </p>
              </div>

              {/* What Will Be Deleted */}
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">
                  The following will be permanently deleted:
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-700">
                    <XCircle className="shrink-0 text-red-500 mt-0.5" size={18} />
                    <span>Your kitchen profile: <strong>{kitchenName}</strong></span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <XCircle className="shrink-0 text-red-500 mt-0.5" size={18} />
                    <span>All menu items and dishes you&apos;ve created</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <XCircle className="shrink-0 text-red-500 mt-0.5" size={18} />
                    <span>All subscription plans and their data</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <XCircle className="shrink-0 text-red-500 mt-0.5" size={18} />
                    <span>All inventory and stock information</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <XCircle className="shrink-0 text-red-500 mt-0.5" size={18} />
                    <span>All order history related to your kitchen</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <XCircle className="shrink-0 text-red-500 mt-0.5" size={18} />
                    <span>Your account and personal data</span>
                  </li>
                </ul>
              </div>

              {/* Confirmation Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  To confirm deletion, type your kitchen name:{" "}
                  <span className="text-red-600">{kitchenName}</span>
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type your kitchen name here"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={deleting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This confirmation is case-sensitive and must match exactly
                </p>
              </div>

              {/* Error Message in Dialog */}
              {error && (
                <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setDeleteConfirmText("");
                    setError("");
                  }}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmText.trim() !== kitchenName.trim()}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={20} />
                  {deleting ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}