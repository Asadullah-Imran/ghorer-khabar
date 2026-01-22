"use client";

import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Save, Lock, Mail, User } from "lucide-react";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Profile form state
  const [profile, setProfile] = useState<AdminProfile>({
    id: "",
    name: "",
    email: "",
    avatar: "",
    role: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setProfile({
        id: user.id,
        name: (user as any).name || "",
        email: user.email || "",
        avatar: (user as any).avatar,
        role: user.role || "",
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSave = async () => {
    if (!profile.name || !profile.email) {
      toast.error("Please fill in all fields");
      return;
    }

    setSaveLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        await refreshUser();
        toast.success("Profile updated", "Your profile has been saved successfully");
      } else {
        const error = await res.json();
        toast.error("Failed to update profile", error.message || "");
      }
    } catch (error) {
      toast.error("Error updating profile", "An unexpected error occurred");
      console.error(error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    setPasswordErrors([]);
  };

  const validatePasswordForm = (): boolean => {
    const errors: string[] = [];

    if (!passwordForm.currentPassword) {
      errors.push("Current password is required");
    }
    if (!passwordForm.newPassword) {
      errors.push("New password is required");
    }
    if (!passwordForm.confirmPassword) {
      errors.push("Password confirmation is required");
    }
    if (passwordForm.newPassword && passwordForm.newPassword.length < 8) {
      errors.push("New password must be at least 8 characters");
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.push("Passwords do not match");
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      errors.push("New password must be different from current password");
    }

    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change-password",
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (res.ok) {
        toast.success("Password changed", "Your password has been updated successfully");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const error = await res.json();
        toast.error("Failed to change password", error.message || "");
      }
    } catch (error) {
      toast.error("Error changing password", "An unexpected error occurred");
      console.error(error);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto flex flex-col">
      <AdminHeader title="Settings" />

      <div className="p-8 space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold mb-2">Admin Settings</h2>
          <p className="text-text-muted">Manage your profile and security preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border-dark">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-3 font-bold transition-colors ${
              activeTab === "profile"
                ? "text-primary border-b-2 border-primary"
                : "text-text-muted hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <User size={18} />
              Profile
            </div>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-3 font-bold transition-colors ${
              activeTab === "security"
                ? "text-primary border-b-2 border-primary"
                : "text-text-muted hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Lock size={18} />
              Security
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-surface-dark border border-border-dark rounded-xl p-8 space-y-6">
              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your full name"
                    className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      placeholder="Enter your email"
                      className="flex-1 bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-colors"
                    />
                    <div className="px-3 py-1 rounded bg-primary/20 text-primary font-bold text-xs whitespace-nowrap">
                      VERIFIED
                    </div>
                  </div>
                </div>

                {/* Role Field */}
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={profile.role}
                    disabled
                    className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-text-muted focus:ring-1 focus:ring-primary outline-none transition-colors cursor-not-allowed"
                  />
                  <p className="text-xs text-text-muted mt-1">Role cannot be changed</p>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleProfileSave}
                  disabled={saveLoading}
                  className="w-full px-4 py-3 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {saveLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Password Change Section */}
              <div className="bg-surface-dark border border-border-dark rounded-xl p-8">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Lock size={20} className="text-primary" />
                  Change Password
                </h3>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-bold text-text-muted mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-colors"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-bold text-text-muted mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your new password (min 8 characters)"
                      className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-colors"
                    />
                    <p className="text-xs text-text-muted mt-1">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-bold text-text-muted mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Re-enter your new password"
                      className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-colors"
                    />
                  </div>

                  {/* Error Messages */}
                  {passwordErrors.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-2">
                      {passwordErrors.map((error, idx) => (
                        <p key={idx} className="text-sm text-red-400">
                          • {error}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full px-4 py-3 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Lock size={18} />
                    {passwordLoading ? "Changing..." : "Change Password"}
                  </button>
                </form>
              </div>

              {/* Security Tips */}
              <div className="bg-surface-dark border border-border-dark rounded-xl p-8">
                <h3 className="font-bold text-lg mb-4">Security Tips</h3>
                <ul className="space-y-3 text-sm text-text-muted">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    Use a strong password with a mix of uppercase, lowercase, numbers, and symbols
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    Never share your password with anyone, including staff
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    Change your password regularly (at least every 90 days)
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    Use a unique password that you don't use on other websites
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
