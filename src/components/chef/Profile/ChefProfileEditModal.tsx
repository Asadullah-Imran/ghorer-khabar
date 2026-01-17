"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";

interface Kitchen {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  area: string;
  image: string;
  profileImage?: string;
  gallery: string[];
}

interface ChefProfileEditModalProps {
  kitchen: Kitchen;
  onClose: () => void;
  onUpdate: (data: Partial<Kitchen>) => void;
}

export default function ChefProfileEditModal({
  kitchen,
  onClose,
  onUpdate,
}: ChefProfileEditModalProps) {
  const [formData, setFormData] = useState({
    name: kitchen.name,
    type: kitchen.type,
    description: kitchen.description,
    location: kitchen.location,
    area: kitchen.area,
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState(kitchen.image);
  const [profileImagePreview, setProfileImagePreview] = useState(
    kitchen.profileImage || "/placeholder-kitchen.jpg"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "media">("basic");

  const coverImageRef = useRef<HTMLInputElement>(null);
  const profileImageRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const uploadData = new FormData();
      uploadData.append("kitchenId", kitchen.id);
      uploadData.append("name", formData.name);
      uploadData.append("type", formData.type);
      uploadData.append("description", formData.description);
      uploadData.append("location", formData.location);
      uploadData.append("area", formData.area);

      if (coverImage) {
        uploadData.append("coverImage", coverImage);
      }
      if (profileImage) {
        uploadData.append("profileImage", profileImage);
      }

      const response = await fetch("/api/chef/profile/update", {
        method: "PUT",
        body: uploadData,
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const result = await response.json();

      onUpdate({
        ...formData,
        image: result.coverImageUrl || coverImagePreview,
        profileImage: result.profileImageUrl || profileImagePreview,
      });

      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Kitchen Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab("basic")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "basic"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "media"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Images
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              {/* Kitchen Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Kitchen Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>

              {/* Kitchen Type */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Kitchen Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Home Kitchen">Home Kitchen</option>
                  <option value="Professional Kitchen">Professional Kitchen</option>
                  <option value="Cloud Kitchen">Cloud Kitchen</option>
                  <option value="Ethnic Kitchen">Ethnic Kitchen</option>
                  <option value="Health Kitchen">Health Kitchen</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Area
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === "media" && (
            <div className="space-y-6">
              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Cover Image
                </label>
                <div className="relative h-48 rounded-lg overflow-hidden bg-gray-100 mb-3">
                  <Image
                    src={coverImagePreview}
                    alt="Cover Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => coverImageRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition"
                >
                  <Upload size={18} />
                  <span>Click to upload cover image</span>
                </button>
                <input
                  ref={coverImageRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
              </div>

              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Profile Image
                </label>
                <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-gray-100 mb-3">
                  <Image
                    src={profileImagePreview}
                    alt="Profile Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => profileImageRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition"
                >
                  <Upload size={18} />
                  <span>Click to upload profile image</span>
                </button>
                <input
                  ref={profileImageRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-900 hover:bg-gray-50 transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal-600 rounded-lg font-medium text-white hover:bg-teal-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
