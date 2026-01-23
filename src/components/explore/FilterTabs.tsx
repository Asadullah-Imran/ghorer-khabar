"use client";

import {
  CalendarCheck,
  ChefHat,
  MapPin,
  Search,
  SlidersHorizontal,
  Utensils,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface FilterTabsProps {
  categories: string[];
}

export default function FilterTabs({ categories }: FilterTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") || "dishes";
  const activeCategory = searchParams.get("category") || "All";
  const activeSort = searchParams.get("sort") || "recommended";
  const activeZone = searchParams.get("zone") || "";

  // Zone filter state
  const [zones, setZones] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchZone, setSearchZone] = useState("");
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);
  const [useZoneFilter, setUseZoneFilter] = useState(!!activeZone);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  // Fetch zones on mount
  useEffect(() => {
    const fetchZones = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/explore/zones");
        const data = await response.json();
        if (data.success) {
          setZones(data.zones);
        }
      } catch (error) {
        console.error("Failed to fetch zones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, []);

  // Prevent body scroll when dropdown is open
  useEffect(() => {
    if (showZoneDropdown) {
      document.body.style.overflow = "hidden";

      // Calculate dropdown position
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
        });
      }
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showZoneDropdown]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All" && key === "category") {
      params.delete(key);
    } else if (value === "" && key === "zone") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const toggleZoneFilter = () => {
    const newState = !useZoneFilter;
    setUseZoneFilter(newState);
    if (!newState) {
      updateParam("zone", "");
    }
  };

  const selectZone = (zone: string) => {
    updateParam("zone", zone);
    setShowZoneDropdown(false);
    setSearchZone("");
  };

  const clearZone = () => {
    updateParam("zone", "");
    setSearchZone("");
  };

  // Filter zones based on search
  const filteredZones = zones.filter((z) =>
    z.toLowerCase().includes(searchZone.toLowerCase())
  );

  // Helper for styling active/inactive tabs
  const getTabClass = (tabName: string) =>
    `flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition ${
      activeTab === tabName
        ? "border-teal-600 text-teal-700"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`;

  return (
    <div className="bg-white sticky top-16 z-30 border-b border-gray-100 shadow-sm overflow-visible">
      <div className="max-w-7xl mx-auto px-4 overflow-visible">
        {/* 1. Main Toggle (Dishes vs Kitchens vs Plans) */}
        <div className="flex w-full overflow-x-auto scrollbar-hide border-b border-gray-100">
          <button
            onClick={() => updateParam("tab", "dishes")}
            className={getTabClass("dishes")}
          >
            <Utensils size={16} /> Dishes
          </button>
          <button
            onClick={() => updateParam("tab", "kitchens")}
            className={getTabClass("kitchens")}
          >
            <ChefHat size={16} /> Kitchens
          </button>
          <button
            onClick={() => updateParam("tab", "subscriptions")}
            className={getTabClass("subscriptions")}
          >
            <CalendarCheck size={16} /> Subscriptions
          </button>
        </div>

        {/* 2. Filters & Sorting Row */}
        <div className="py-3 flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
          {/* Category Pills (Only show for Dishes) */}
          {activeTab === "dishes" && (
            <div className="flex items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateParam("category", cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition ${
                    activeCategory === cat
                      ? "bg-teal-600 border-teal-600 text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:border-teal-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Zone Filter Toggle (Only show for Dishes) */}
          {activeTab === "dishes" && (
            <div className="flex items-center gap-2 relative z-40">
              {/* Toggle Button */}
              <button
                onClick={toggleZoneFilter}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition whitespace-nowrap ${
                  useZoneFilter
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"
                }`}
              >
                <MapPin size={14} />
                Zone
              </button>

              {/* Zone Dropdown */}
              {useZoneFilter && (
                <div ref={dropdownRef} className="relative">
                  <button
                    ref={buttonRef}
                    onClick={() => setShowZoneDropdown(!showZoneDropdown)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition whitespace-nowrap ${
                      activeZone
                        ? "bg-teal-50 border-teal-300 text-teal-700"
                        : "bg-white border-gray-200 text-gray-600 hover:border-teal-300"
                    }`}
                  >
                    {activeZone || "Select Zone"}
                    {activeZone && (
                      <X size={12} onClick={(e) => {
                        e.stopPropagation();
                        clearZone();
                      }} className="cursor-pointer hover:text-red-500" />
                    )}
                  </button>

                  {/* Dropdown Overlay & Menu */}
                  {showZoneDropdown && (
                    <>
                      {/* Backdrop overlay to close dropdown when clicking outside */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowZoneDropdown(false)}
                      />

                      {/* Dropdown Menu - Fixed positioning */}
                      <div 
                        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-2xl"
                        style={{
                          top: `${dropdownPos.top}px`,
                          left: `${dropdownPos.left}px`,
                          minWidth: "280px",
                          maxWidth: "400px",
                          maxHeight: "400px",
                        }}
                      >
                        {/* Search Box - Sticky */}
                        <div className="p-2 border-b border-gray-100 sticky top-0 bg-white rounded-t-lg z-10">
                          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded">
                            <Search size={14} className="text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search zones..."
                              value={searchZone}
                              onChange={(e) => setSearchZone(e.target.value)}
                              className="bg-transparent text-xs outline-none w-full"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        {/* Zone List - Scrollable */}
                        <div className="overflow-y-auto" style={{ maxHeight: "320px" }}>
                          {loading ? (
                            <div className="p-4 text-center text-xs text-gray-500">
                              Loading zones...
                            </div>
                          ) : filteredZones.length > 0 ? (
                            filteredZones.map((zone) => (
                              <button
                                key={zone}
                                onClick={() => selectZone(zone)}
                                className={`w-full text-left px-4 py-2 text-xs font-medium transition ${
                                  activeZone === zone
                                    ? "bg-teal-100 text-teal-700"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {zone}
                              </button>
                            ))
                          ) : (
                            <div className="p-4 text-center text-xs text-gray-500">
                              No zones found
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="ml-auto flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-gray-400" />
            <select
              value={activeSort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="text-xs font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
