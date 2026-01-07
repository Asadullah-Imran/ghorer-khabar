"use client";

import LocationPicker from "@/components/profile/address/LocationPicker";
import { MapPin } from "lucide-react";
import { useState } from "react";

interface KitchenAddressStepProps {
  address: string;
  zone: string;
  latitude: number | null;
  longitude: number | null;
  onAddressChange: (value: string) => void;
  onZoneChange: (value: string) => void;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
  errors?: { address?: string; zone?: string; location?: string };
}

// Helper function to extract zone from full address
function extractZoneFromAddress(fullAddress: string): string {
  // Common Dhaka zones/areas - extend this list as needed
  const zones = [
    "Uttara",
    "Banani",
    "Gulshan",
    "Dhanmondi",
    "Mirpur",
    "Mohammadpur",
    "Bashundhara",
    "Badda",
    "Rampura",
    "Khilgaon",
    "Motijheel",
    "Tejgaon",
    "Farmgate",
    "Kawran Bazar",
    "Panthapath",
    "Green Road",
    "Lalmatia",
    "Mohakhali",
    "Baridhara",
    "Nikunja",
    "Pallabi",
    "Kafrul",
    "Cantonment",
    "Old Dhaka",
    "Lalbagh",
    "Kamrangirchar",
    "Jatrabari",
    "Sayedabad",
    "Demra",
    "Tongi",
    "Savar",
    "Keraniganj",
    "Ashulia",
    "Kurmitola",
    "Solmaid",
    "Zia Colony",
  ];

  // Try to find a matching zone in the address
  for (const zone of zones) {
    if (fullAddress.toLowerCase().includes(zone.toLowerCase())) {
      return zone;
    }
  }

  // If no known zone found, try to extract from common patterns
  // Split by comma and look for the area name (usually 2nd or 3rd segment)
  const parts = fullAddress.split(",").map((p) => p.trim());

  // Skip numeric values (postal codes) and common words
  const skipWords = [
    "dhaka",
    "bangladesh",
    "division",
    "district",
    "metropolitan",
    "road",
    "block",
  ];

  for (let i = 1; i < Math.min(parts.length - 2, 4); i++) {
    const part = parts[i];
    // Check if it's not a number and not a skip word
    if (
      !/^\d+$/.test(part) &&
      !skipWords.some((word) => part.toLowerCase().includes(word))
    ) {
      return part;
    }
  }

  return "";
}

export default function KitchenAddressStep({
  address,
  zone,
  latitude,
  longitude,
  onAddressChange,
  onZoneChange,
  onLocationChange,
  errors,
}: KitchenAddressStepProps) {
  const [showMap, setShowMap] = useState(false);

  const handleLocationSelect = (lat: number, lng: number, addr?: string) => {
    onLocationChange(lat, lng, addr);

    if (addr) {
      // Always auto-fill the address field with fetched address
      onAddressChange(addr);

      // Auto-extract and fill zone
      const extractedZone = extractZoneFromAddress(addr);
      if (extractedZone) {
        onZoneChange(extractedZone);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="bg-[#477e77]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="text-[#477e77]" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-[#1b0e0e]">Kitchen Location</h2>
        <p className="text-gray-600">Where will you be cooking from?</p>
      </div>

      <div className="space-y-4">
        {/* Map Selection - Show First */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Pin Location on Map <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            📍 Click the map to auto-fill your address and zone
          </p>

          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="w-full px-4 py-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#477e77] transition-colors flex items-center justify-center gap-2 group"
          >
            <MapPin
              className="text-gray-400 group-hover:text-[#477e77]"
              size={20}
            />
            <span className="text-gray-600 group-hover:text-[#477e77] font-medium">
              {latitude && longitude
                ? "Update Location"
                : "Select Location on Map"}
            </span>
          </button>

          {latitude && longitude && (
            <div className="bg-[#feb728]/10 border border-[#feb728]/30 rounded-lg p-3 flex items-start gap-2">
              <MapPin className="text-[#feb728] flex-shrink-0" size={16} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1b0e0e]">
                  📍 Location Selected
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
                {address && (
                  <p className="text-xs text-gray-700 mt-1 line-clamp-2">
                    {address}
                  </p>
                )}
              </div>
            </div>
          )}

          {errors?.location && (
            <p className="text-sm text-red-500">{errors.location}</p>
          )}
        </div>

        {/* Address Field */}
        <div className="space-y-2">
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Full Address <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-1">
            Auto-filled from map or edit manually
          </p>
          <textarea
            id="address"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Select location on map to auto-fill, or enter manually"
            rows={3}
            className={`
              w-full px-4 py-3 rounded-lg border-2 transition-colors resize-none
              focus:outline-none focus:ring-2 focus:ring-[#477e77]/20
              ${
                errors?.address
                  ? "border-red-500"
                  : "border-gray-200 focus:border-[#477e77]"
              }
            `}
          />
          {errors?.address && (
            <p className="text-sm text-red-500">{errors.address}</p>
          )}
        </div>

        {/* Zone Field */}
        <div className="space-y-2">
          <label
            htmlFor="zone"
            className="block text-sm font-medium text-gray-700"
          >
            Zone/Area <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-1">
            Auto-extracted from address or enter manually
          </p>
          <input
            type="text"
            id="zone"
            value={zone}
            onChange={(e) => onZoneChange(e.target.value)}
            placeholder="e.g., Uttara, Bashundhara, Dhanmondi"
            className={`
              w-full px-4 py-3 rounded-lg border-2 transition-colors
              focus:outline-none focus:ring-2 focus:ring-[#477e77]/20
              ${
                errors?.zone
                  ? "border-red-500"
                  : "border-gray-200 focus:border-[#477e77]"
              }
            `}
          />
          {errors?.zone && (
            <p className="text-sm text-red-500">{errors.zone}</p>
          )}
        </div>
      </div>

      <div className="bg-[#feb728]/10 border border-[#feb728]/30 rounded-lg p-4">
        <h3 className="font-semibold text-sm text-[#1b0e0e] mb-2">
          📍 Why location matters:
        </h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Helps customers find you easily</li>
          <li>• Enables accurate delivery time estimates</li>
          <li>• Shows nearby customers your delicious offerings</li>
        </ul>
      </div>

      {/* Location Picker Modal */}
      {showMap && (
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowMap(false)}
          initialLat={latitude || 23.8103}
          initialLng={longitude || 90.4125}
        />
      )}
    </div>
  );
}
