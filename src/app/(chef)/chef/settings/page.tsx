"use client";

import { useState } from "react";
import {
  Save,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  Building2,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface OperatingDay {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export default function SettingsPage() {
  // General Information State
  const [kitchenName, setKitchenName] = useState("Rahim's Curry House");
  const [address, setAddress] = useState(
    "House 42, Road 7, Dhanmondi, Dhaka - 1209"
  );
  const ownerName = "Rahim Ahmed"; // Read-only
  const phoneNumber = "+880 1712-345678"; // Read-only

  // Operating Hours State
  const [operatingHours, setOperatingHours] = useState<OperatingDay[]>([
    { day: "Monday", isOpen: true, openTime: "10:00", closeTime: "22:00" },
    { day: "Tuesday", isOpen: true, openTime: "10:00", closeTime: "22:00" },
    { day: "Wednesday", isOpen: true, openTime: "10:00", closeTime: "22:00" },
    { day: "Thursday", isOpen: true, openTime: "10:00", closeTime: "22:00" },
    { day: "Friday", isOpen: true, openTime: "10:00", closeTime: "23:00" },
    { day: "Saturday", isOpen: true, openTime: "09:00", closeTime: "23:00" },
    { day: "Sunday", isOpen: false, openTime: "10:00", closeTime: "22:00" },
  ]);

  // Legal & Verification (Read-only)
  const verificationStatus = "verified"; // "verified" | "pending" | "rejected"
  const tradeLicense = "****-5678";
  const nidNumber = "****-****-4321";

  const handleSaveGeneral = () => {
    alert("General information saved successfully!");
    // API call would go here
  };

  const toggleDayOpen = (index: number) => {
    const updated = [...operatingHours];
    updated[index].isOpen = !updated[index].isOpen;
    setOperatingHours(updated);
  };

  const updateTime = (index: number, field: "openTime" | "closeTime", value: string) => {
    const updated = [...operatingHours];
    updated[index][field] = value;
    setOperatingHours(updated);
  };

  const handleSaveHours = () => {
    alert("Operating hours saved successfully!");
    // API call would go here
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted."
      )
    ) {
      alert("Account deletion initiated. You will be logged out.");
      // API call would go here
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900">Business Settings</h1>
        <p className="text-gray-500 mt-2">
          Manage your kitchen profile, hours, and legal details.
        </p>
      </div>

      {/* Section 1: General Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="text-yellow-500" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">General Information</h2>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
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
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
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
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
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
            className="w-full md:w-auto px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition shadow-md flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>
      </div>

      {/* Section 2: Operating Hours */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="text-teal-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Opening & Closing Hours</h2>
        </div>

        <div className="space-y-3">
          {operatingHours.map((day, index) => (
            <div
              key={day.day}
              className="flex flex-col md:flex-row md:items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Day Name */}
              <div className="flex-shrink-0 w-32">
                <span className="font-semibold text-gray-900">{day.day}</span>
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
                    onChange={(e) => updateTime(index, "openTime", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 text-sm font-semibold"
                  />
                  <span className="text-gray-600 font-semibold">to</span>
                  <input
                    type="time"
                    value={day.closeTime}
                    onChange={(e) => updateTime(index, "closeTime", e.target.value)}
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
          className="mt-6 w-full md:w-auto px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition shadow-md flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Save Operating Hours
        </button>
      </div>

      {/* Section 3: Legal & Verification */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="text-teal-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Legal & Verification</h2>
        </div>

        {/* Verification Status Badge */}
        <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-teal-100 border-2 border-teal-300 rounded-lg">
          <div className="flex items-center gap-3">
            {verificationStatus === "verified" && (
              <>
                <CheckCircle2 className="text-green-600" size={32} />
                <div>
                  <p className="font-bold text-gray-900 text-lg">Verified Kitchen</p>
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
                  <p className="font-bold text-gray-900 text-lg">Verification Pending</p>
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
                  <p className="font-bold text-gray-900 text-lg">Verification Rejected</p>
                  <p className="text-sm text-gray-600">
                    Please contact support for more details
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Trade License */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Trade License / TIN
            </label>
            <input
              type="text"
              value={tradeLicense}
              disabled
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed font-mono"
            />
          </div>

          {/* NID Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              NID Number
            </label>
            <input
              type="text"
              value={nidNumber}
              disabled
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed font-mono"
            />
          </div>

          {/* Helper Text */}
          <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertTriangle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> To update legal details or submit new
              documents, please contact our support team at{" "}
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
            <h3 className="font-bold text-gray-900 mb-1">Delete Kitchen Account</h3>
            <p className="text-sm text-gray-600 mb-4">
              Permanently delete your kitchen account and all associated data.
              This action cannot be undone. All orders, menu items, and customer
              data will be permanently removed.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition shadow-md flex items-center gap-2"
            >
              <Trash2 size={20} />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
