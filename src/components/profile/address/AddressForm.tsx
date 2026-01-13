"use client";

import { geocodeAddress } from "@/lib/utils/geocoding";
import { Loader2, Map, MapPin, Search, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
});

interface AddressFormProps {
  onClose: () => void;
  onSubmit: (data: AddressFormData) => Promise<void>;
  initialData?: AddressFormData;
}

export interface AddressFormData {
  id?: string;
  label: string;
  address: string;
  zone: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
}

export default function AddressForm({
  onClose,
  onSubmit,
  initialData,
}: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    label: initialData?.label || "",
    address: initialData?.address || "",
    zone: initialData?.zone || "",
    latitude: initialData?.latitude || null,
    longitude: initialData?.longitude || null,
    isDefault: initialData?.isDefault || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMapPicker, setShowMapPicker] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.label.trim()) {
      setError("Label is required");
      return;
    }
    if (!formData.address.trim()) {
      setError("Address is required");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        setError("Failed to get current location");
        setLoading(false);
      }
    );
  };

  const handleGeocodeAddress = async () => {
    if (!formData.address.trim()) {
      setError("Please enter an address first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await geocodeAddress(formData.address);

      if (!result) {
        setError(
          "Could not find coordinates for this address. Try being more specific or use Google Maps."
        );
        setLoading(false);
        return;
      }

      setFormData({
        ...formData,
        latitude: result.latitude,
        longitude: result.longitude,
      });
      setLoading(false);
    } catch (err) {
      setError("Failed to geocode address");
      setLoading(false);
    }
  };

  const handleLocationFromMap = (
    lat: number,
    lng: number,
    address?: string
  ) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
      ...(address && !formData.address.trim() && { address }), // Auto-fill address if empty
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? "Edit Address" : "Add New Address"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Label */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Label *
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              placeholder="e.g., Home, Office, Parents' House"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Address *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Enter complete address"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Zone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Zone/Area
            </label>
            <input
              type="text"
              value={formData.zone}
              onChange={(e) =>
                setFormData({ ...formData, zone: e.target.value })
              }
              placeholder="e.g., Uttara, Bashundhara, Dhanmondi"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none"
            />
          </div>

          {/* Coordinates */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Location Coordinates
            </label>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={loading}
                className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <MapPin size={16} />
                )}
                GPS
              </button>

              <button
                type="button"
                onClick={handleGeocodeAddress}
                disabled={loading || !formData.address.trim()}
                className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 font-semibold hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
                Find
              </button>

              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                disabled={loading}
                className="px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 font-semibold hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                <Map size={16} />
                Map
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      latitude: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    })
                  }
                  placeholder="Latitude"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      longitude: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    })
                  }
                  placeholder="Longitude"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Set as Default */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) =>
                setFormData({ ...formData, isDefault: e.target.checked })
              }
              className="w-4 h-4 text-brand-teal border-gray-300 rounded focus:ring-brand-teal"
            />
            <label
              htmlFor="isDefault"
              className="text-sm font-semibold text-gray-700"
            >
              Set as default address
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-brand-teal text-white rounded-lg font-semibold hover:bg-brand-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Address"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <LocationPicker
          onLocationSelect={handleLocationFromMap}
          onClose={() => setShowMapPicker(false)}
          initialLat={formData.latitude || 23.8103}
          initialLng={formData.longitude || 90.4125}
        />
      )}
    </div>
  );
}
