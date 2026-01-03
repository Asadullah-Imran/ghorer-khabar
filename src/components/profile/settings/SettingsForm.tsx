"use client";

import {
  Bell,
  Camera,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  User,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function SettingsForm({ initialData }: { initialData: any }) {
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(initialData.personal);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert("Settings saved successfully!");
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* 1. Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === "general"
              ? "border-teal-600 text-teal-800 bg-teal-50/50"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <User size={18} /> General
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === "security"
              ? "border-teal-600 text-teal-800 bg-teal-50/50"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Lock size={18} /> Security
        </button>
      </div>

      {/* 2. Content */}
      <div className="p-6 md:p-8">
        {/* --- GENERAL TAB --- */}
        {activeTab === "general" && (
          <form onSubmit={handleSave} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100">
                <Image
                  src={formData.avatar}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <button
                  type="button"
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  <Camera size={16} /> Change Photo
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  JPG, GIF or PNG. Max size 800K
                </p>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="space-y-2">
                <span className="text-sm font-bold text-gray-700">
                  Full Name
                </span>
                <div className="relative">
                  <User
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold text-gray-700">
                  Email Address
                </span>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold text-gray-700">
                  Phone Number
                </span>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                  />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </label>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-70"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {/* --- SECURITY TAB --- */}
        {activeTab === "security" && (
          <form onSubmit={handleSave} className="space-y-6 max-w-md">
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-bold text-gray-700">
                  Current Password
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-bold text-gray-700">
                  New Password
                </span>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-bold text-gray-700">
                  Confirm Password
                </span>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </label>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex gap-3 items-start">
              <Bell className="text-yellow-600 mt-0.5 shrink-0" size={18} />
              <div>
                <h4 className="text-sm font-bold text-yellow-800">
                  Security Alert
                </h4>
                <p className="text-xs text-yellow-700 mt-1">
                  Changing your password will log you out of all other devices.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2"
              >
                <Save size={18} /> Update Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
