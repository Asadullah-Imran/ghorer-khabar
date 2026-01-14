"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  AlertCircle,
  Bell,
  Camera,
  CheckCircle,
  Loader2,
  Lock,
  Phone,
  Save,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface UserProfile {
  name: string;
  phone: string;
  avatar: string;
  authProvider?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsForm() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form data
  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    phone: "",
    avatar: "",
    authProvider: "EMAIL",
  });

  // Password form data
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user data from auth context
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.user_metadata?.name || user.user_metadata?.full_name || "",
        phone: "", // Will be loaded from API
        avatar:
          user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
      });

      // Fetch full profile from API to get phone number
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.user.name || "",
          phone: data.user.phone || "",
          avatar: data.user.avatar || "",
          authProvider: data.user.authProvider || "EMAIL",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Invalid file type. Only JPG, PNG, and WebP are allowed.",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "File too large. Maximum size is 10MB.",
      });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      // Upload to Supabase storage
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "avatars");

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const uploadData = await uploadResponse.json();

      // Update profile with new avatar URL
      setFormData((prev) => ({ ...prev, avatar: uploadData.url }));

      setMessage({
        type: "success",
        text: "Avatar uploaded! Click 'Save Changes' to update your profile.",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setMessage({
        type: "error",
        text: "Failed to upload avatar. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });

      // Refresh user data in auth context
      await refreshUser();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: "error",
        text: "New passwords do not match",
      });
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setMessage({
        type: "success",
        text: "Password updated successfully!",
      });

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update password. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const dismissMessage = () => setMessage(null);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Hidden file input for avatar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 flex items-center justify-between ${
            message.type === "success"
              ? "bg-green-50 border-b border-green-100"
              : "bg-red-50 border-b border-red-100"
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === "success" ? (
              <CheckCircle className="text-green-600" size={20} />
            ) : (
              <AlertCircle className="text-red-600" size={20} />
            )}
            <p
              className={`text-sm font-medium ${
                message.type === "success" ? "text-green-800" : "text-red-800"
              }`}
            >
              {message.text}
            </p>
          </div>
          <button
            onClick={dismissMessage}
            className={`p-1 rounded hover:bg-opacity-20 ${
              message.type === "success"
                ? "hover:bg-green-600"
                : "hover:bg-red-600"
            }`}
          >
            <X
              size={16}
              className={
                message.type === "success" ? "text-green-600" : "text-red-600"
              }
            />
          </button>
        </div>
      )}

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
        {/* Only show Security tab for EMAIL users */}
        {formData.authProvider === "EMAIL" && (
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
        )}
      </div>

      {/* 2. Content */}
      <div className="p-6 md:p-8">
        {/* --- GENERAL TAB --- */}
        {activeTab === "general" && (
          <form onSubmit={handleProfileSave} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100">
                {isUploading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Loader2 className="animate-spin text-teal-600" size={24} />
                  </div>
                ) : formData.avatar ? (
                  <Image
                    src={formData.avatar}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <User className="text-gray-400" size={32} />
                  </div>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera size={16} />{" "}
                  {isUploading ? "Uploading..." : "Change Photo"}
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  JPG, PNG or WebP. Max size 10MB
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
                    placeholder="Enter your name"
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
                    placeholder="+8801712345678"
                  />
                </div>
              </label>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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
          <form onSubmit={handlePasswordSave} className="space-y-6 max-w-md">
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-bold text-gray-700">
                  Current Password
                </span>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                  required
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-bold text-gray-700">
                  New Password
                </span>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                  required
                  minLength={6}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-bold text-gray-700">
                  Confirm Password
                </span>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                  required
                  minLength={6}
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
                disabled={isSaving}
                className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {isSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
