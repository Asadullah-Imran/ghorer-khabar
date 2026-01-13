"use client";

import { useEffect, useState } from "react";
import { X, Loader2, MapPin } from "lucide-react";
import { reverseGeocode } from "@/lib/utils/geocoding";

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationPicker({
  onLocationSelect,
  onClose,
  initialLat = 23.8103, // Dhaka, Bangladesh default
  initialLng = 90.4125,
}: LocationPickerProps) {
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mapError, setMapError] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    
    // Dynamically import leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default marker icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let map: any;
    let marker: any;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        // Initialize map
        map = L.map("location-map").setView([initialLat, initialLng], 13);

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        // Add click event
        map.on("click", async (e: any) => {
          const { lat, lng } = e.latlng;
          
          // Remove existing marker
          if (marker) {
            map.removeLayer(marker);
          }

          // Add new marker
          marker = L.marker([lat, lng]).addTo(map);
          
          setSelectedLat(lat);
          setSelectedLng(lng);
          setLoading(true);

          // Get address from coordinates
          const addr = await reverseGeocode(lat, lng);
          if (addr) {
            setAddress(addr);
          }
          setLoading(false);
        });

      } catch (error) {
        console.error("Map initialization error:", error);
        setMapError("Failed to load map. Please try again.");
      }
    };

    initMap();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [mounted, initialLat, initialLng]);

  const handleConfirm = () => {
    if (selectedLat !== null && selectedLng !== null) {
      onLocationSelect(selectedLat, selectedLng, address);
      onClose();
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pick Location on Map</h2>
            <p className="text-sm text-gray-500 mt-1">Click anywhere on the map to select a location</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-gray-100">
          <div 
            id="location-map" 
            className="w-full h-full min-h-[400px]"
            style={{ zIndex: 0 }}
          />
          
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90">
              <div className="text-center p-6">
                <p className="text-red-600 font-semibold">{mapError}</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-brand-teal text-white rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Selected Location Info */}
          {selectedLat !== null && selectedLng !== null && (
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4 z-[1000]">
              <div className="flex items-start gap-3">
                <div className="bg-brand-teal/10 p-2 rounded-lg">
                  <MapPin className="text-brand-teal" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm">Selected Location</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
                  </p>
                  {loading ? (
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Loader2 size={12} className="animate-spin" />
                      Getting address...
                    </div>
                  ) : address ? (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{address}</p>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedLat === null || selectedLng === null}
            className="flex-1 px-4 py-3 bg-brand-teal text-white rounded-lg font-semibold hover:bg-brand-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
