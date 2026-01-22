"use client";

import { useCart } from "@/components/cart/CartProvider";
import LocationPicker from "@/components/profile/address/LocationPicker";
import { useToast } from "@/contexts/ToastContext";
import {
    ArrowRight,
    BadgeCheck,
    Banknote,
    Clock,
    Info,
    Loader2,
    MapPin,
    ShieldCheck,
    Truck,
    UserCheck,
    Calendar,
    UtensilsCrossed
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MealTimeSlot, MEAL_TIME_SLOTS, getAllMealSlots } from "@/lib/constants/mealTimeSlots";

export default function CheckoutPageContent({ userData }: { userData: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kitchenId = searchParams.get("kitchenId");
  const toast = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false); // Track success to prevent redirect
  const { items: allItems, removeItemsByKitchen, isInitialized } = useCart();
  
  // Filter items for specific kitchen
  const items = useMemo(() => {
      if (!kitchenId) return [];
      return allItems.filter(item => item.kitchenId === kitchenId);
  }, [allItems, kitchenId]);

  useEffect(() => {
      // Only redirect if cart is fully loaded and initialized
      // AND if we haven't just placed an order successfully
      if (isInitialized && !isOrderPlaced) {
          if (!kitchenId || items.length === 0) {
              // Redirect to cart if no kitchen selected or no items for that kitchen
              router.push("/cart");
          }
      }
  }, [kitchenId, items, router, isInitialized, isOrderPlaced]);

  // Show loading while initializing cart
  if (!isInitialized) {
      return (
          <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="animate-spin text-teal-600" size={40} />
          </div>
      );
  }

  const [showMap, setShowMap] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Fetch addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch("/api/addresses");
        if (res.ok) {
          const data = await res.json();
          setAddresses(data.addresses);
          // Auto-select default address if exists
          const defaultAddr = data.addresses.find((a: any) => a.isDefault);
          if (defaultAddr) {
             setFormData(prev => ({ 
               ...prev, 
               address: defaultAddr.address,
               addressId: defaultAddr.id 
             }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, []);
  
  // Delivery charge state
  const [deliveryInfo, setDeliveryInfo] = useState<{
    distance: number | null;
    charge: number | null;
    available: boolean;
    error?: string;
  }>({
    distance: null,
    charge: 60, // Default fallback
    available: true,
  });
  const [loadingDelivery, setLoadingDelivery] = useState(false);

  // Calculate totals
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const delivery = deliveryInfo.charge ?? 60; // Use calculated charge or fallback
  const total = subtotal + delivery;

  // Form State
  const [formData, setFormData] = useState({
    name: userData.fullName,
    phone: userData.phone,
    address: userData.savedAddress || "",
    addressId: "" as string | "",
    note: "",
    deliveryDate: "", // Will be set to tomorrow
    deliveryTimeSlot: "" as MealTimeSlot | "",
  });

  // Available time slots
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Selected location from map picker
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Set default delivery date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dateString = tomorrow.toISOString().split("T")[0];
    setFormData(prev => ({ ...prev, deliveryDate: dateString }));
  }, []);

  // Fetch available time slots when items or delivery date changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!kitchenId || items.length === 0 || !formData.deliveryDate) {
        return;
      }

      try {
        setLoadingSlots(true);
        const menuItemIds = items.map(item => item.id);
        
        const response = await fetch(
          `/api/orders/available-slots?kitchenId=${kitchenId}&menuItemIds=${JSON.stringify(menuItemIds)}&deliveryDate=${formData.deliveryDate}`
        );

        if (response.ok) {
          const data = await response.json();
          setAvailableSlots(data.data?.slots || []);
          
          // Auto-select first available slot if none selected
          if (!formData.deliveryTimeSlot) {
            const firstAvailable = data.data?.slots?.find((slot: any) => slot.available);
            if (firstAvailable) {
              setFormData(prev => ({ ...prev, deliveryTimeSlot: firstAvailable.slot }));
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch available slots:", error);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [kitchenId, items, formData.deliveryDate]);

  // Fetch delivery charge when address or kitchen changes
  useEffect(() => {
    const fetchDeliveryCharge = async () => {
      if (!kitchenId) {
        // Reset to default if no kitchen
        setDeliveryInfo({
          distance: null,
          charge: 60,
          available: true,
        });
        return;
      }

      // If addressId is available, use it
      if (formData.addressId) {
        try {
          setLoadingDelivery(true);
          const response = await fetch(
            `/api/orders/calculate-delivery?kitchenId=${kitchenId}&addressId=${formData.addressId}`
          );

          if (response.ok) {
            const data = await response.json();
            setDeliveryInfo(data.data);
          } else {
            const errorData = await response.json();
            setDeliveryInfo({
              distance: null,
              charge: 60,
              available: false,
              error: errorData.error || "Failed to calculate delivery charge",
            });
          }
        } catch (error) {
          console.error("Failed to fetch delivery charge:", error);
          setDeliveryInfo({
            distance: null,
            charge: 60,
            available: true,
          });
        } finally {
          setLoadingDelivery(false);
        }
      } 
      // If location is selected from map, use lat/lng
      else if (selectedLocation) {
        try {
          setLoadingDelivery(true);
          const response = await fetch(
            `/api/orders/calculate-delivery?kitchenId=${kitchenId}&lat=${selectedLocation.lat}&lng=${selectedLocation.lng}`
          );

          if (response.ok) {
            const data = await response.json();
            setDeliveryInfo(data.data);
          } else {
            const errorData = await response.json();
            setDeliveryInfo({
              distance: null,
              charge: 60,
              available: false,
              error: errorData.error || "Failed to calculate delivery charge",
            });
          }
        } catch (error) {
          console.error("Failed to fetch delivery charge:", error);
          setDeliveryInfo({
            distance: null,
            charge: 60,
            available: true,
          });
        } finally {
          setLoadingDelivery(false);
        }
      }
      // No address selected
      else {
        setDeliveryInfo({
          distance: null,
          charge: 60,
          available: true,
        });
      }
    };

    fetchDeliveryCharge();
  }, [kitchenId, formData.addressId, selectedLocation]);

  const handleLocationSelect = async (lat: number, lng: number, address?: string) => {
    if (address) {
        setFormData(prev => ({ ...prev, address, addressId: "" }));
        setSelectedLocation({ lat, lng });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate delivery date and time slot
    if (!formData.deliveryDate) {
      toast.error("Validation Error", "Please select a delivery date");
      return;
    }

    if (!formData.deliveryTimeSlot) {
      toast.error("Validation Error", "Please select a delivery time slot");
      return;
    }

    // Validate delivery availability
    if (!deliveryInfo.available) {
      toast.error(
        "Delivery Unavailable", 
        deliveryInfo.error || "Delivery is not available for this distance. Please select a different address."
      );
      return;
    }

    if (!formData.addressId && !selectedLocation) {
      toast.error("Validation Error", "Please select a delivery address with location using the map or saved addresses");
      return;
    }

    setIsSubmitting(true);

    try {
        const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                items: items.map(i => ({ id: i.id, quantity: i.quantity })),
                notes: formData.note,
                deliveryDate: formData.deliveryDate,
                deliveryTimeSlot: formData.deliveryTimeSlot,
                addressId: formData.addressId || undefined,
                deliveryLat: selectedLocation?.lat,
                deliveryLng: selectedLocation?.lng,
                deliveryDetails: {
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address
                }
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Failed to place order");
        }

        // 1. Mark order as placed so the useEffect doesn't redirect to /cart
        setIsOrderPlaced(true);

        // 2. Remove ONLY items for this kitchen
        if (kitchenId) {
            removeItemsByKitchen(kitchenId);
        }

        // 3. Navigate to order details
        router.push(`/orders/${data.orderId}`);
    } catch (error: any) {
        toast.error("Order Failed", error.message);
        setIsSubmitting(false); // Only reset if error
    } 
    // Do not reset submitting or orderPlaced if success, as we are navigating away
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
    >
      {/* --- LEFT COLUMN: DELIVERY DETAILS --- */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Form Card */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <Truck className="text-teal-700" size={24} />
            <h2 className="text-gray-900 text-xl font-bold">
              Delivery Details
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            {/* Name & Phone */}
            <div className="flex flex-col md:flex-row gap-5">
              <label className="flex flex-col flex-1">
                <span className="text-gray-900 text-sm font-semibold pb-2">
                  Full Name
                </span>
                <input
                  required
                  type="text"
                  className="w-full rounded-lg border border-gray-300 bg-white h-12 px-4 text-base focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none transition-all placeholder:text-gray-400"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </label>

              <label className="flex flex-col flex-1">
                <span className="text-gray-900 text-sm font-semibold pb-2">
                  Phone Number
                </span>
                <div className="relative">
                  <input
                    required
                    type="tel"
                    className="w-full rounded-lg border border-gray-300 bg-white h-12 px-4 text-base focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none transition-all placeholder:text-gray-400"
                    placeholder="+8801..."
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                  <BadgeCheck
                    className="absolute right-3 top-3 text-teal-600"
                    size={20}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Info size={14} /> We will call this number to confirm
                  delivery.
                </p>
              </label>
            </div>

            {/* Address Selection */}
            <div className="flex flex-col gap-3">
               <span className="text-gray-900 text-sm font-semibold">
                  Delivery Address
               </span>
               
               {/* Saved Addresses List */}
                {!loadingAddresses && addresses.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 mb-2">
                        {addresses.map((addr) => (
                            <div 
                                key={addr.id}
                                onClick={() => setFormData({ 
                                  ...formData, 
                                  address: addr.address,
                                  addressId: addr.id 
                                })}
                                className={`p-3 rounded-lg border-2 cursor-pointer flex items-start gap-3 transition-colors ${
                                    formData.addressId === addr.id 
                                    ? "border-teal-600 bg-teal-50/50" 
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                     formData.addressId === addr.id ? "border-teal-600" : "border-gray-300"
                                }`}>
                                    {formData.addressId === addr.id && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{addr.label}</p>
                                    <p className="text-xs text-gray-500 line-clamp-2">{addr.address}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

               {/* Manual Input & Map Trigger */}
               <div className="flex gap-2">
                 <div className="flex-1">
                   <input
                     required
                     type="text"
                     className="w-full rounded-lg border border-gray-300 bg-white h-12 px-4 text-base focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none transition-all placeholder:text-gray-400"
                     placeholder="House No, Road No, Area..."
                     value={formData.address}
                     onChange={(e) => {
                       setFormData({ ...formData, address: e.target.value, addressId: "" });
                       setSelectedLocation(null); // Clear map selection when typing
                     }}
                   />
                 </div>
                 <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className="h-12 w-12 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-teal-600 text-gray-600 hover:text-teal-600 transition-all"
                    title="Pick from Map"
                 >
                    <MapPin size={20} />
                 </button>
               </div>
               {!formData.addressId && !selectedLocation && (
                 <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                   <Info size={12} />
                   Select a saved address or use the map to get accurate delivery charges
                 </p>
               )}
            </div>

            {/* Delivery Date & Time Slot */}
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-gray-900 text-sm font-semibold pb-2 block">
                  Delivery Date & Time
                </span>
                <p className="text-xs text-gray-500 mb-3">
                  Orders must be placed at least 36 hours before delivery
                </p>
              </div>

              {/* Delivery Date */}
              <div>
                <label className="flex flex-col">
                  <span className="text-xs text-gray-600 mb-2">Delivery Date</span>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      required
                      type="date"
                      min={(() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return tomorrow.toISOString().split("T")[0];
                      })()}
                      className="w-full rounded-lg border border-gray-300 bg-white h-12 pl-10 pr-4 text-base focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none transition-all"
                      value={formData.deliveryDate}
                      onChange={(e) => {
                        setFormData({ ...formData, deliveryDate: e.target.value, deliveryTimeSlot: "" });
                      }}
                    />
                  </div>
                </label>
              </div>

              {/* Time Slot Selector */}
              <div>
                <label className="flex flex-col">
                  <span className="text-xs text-gray-600 mb-2">Meal Time</span>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center h-12 border border-gray-300 rounded-lg bg-gray-50">
                      <Loader2 className="animate-spin text-teal-600" size={20} />
                      <span className="ml-2 text-sm text-gray-600">Loading available slots...</span>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.slot}
                          type="button"
                          onClick={() => {
                            if (slot.available) {
                              setFormData({ ...formData, deliveryTimeSlot: slot.slot });
                            }
                          }}
                          disabled={!slot.available}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            formData.deliveryTimeSlot === slot.slot
                              ? "border-teal-600 bg-teal-50"
                              : slot.available
                              ? "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                              : "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <UtensilsCrossed
                                size={16}
                                className={
                                  formData.deliveryTimeSlot === slot.slot
                                    ? "text-teal-600"
                                    : "text-gray-400"
                                }
                              />
                              <span
                                className={`text-sm font-bold ${
                                  formData.deliveryTimeSlot === slot.slot
                                    ? "text-teal-700"
                                    : slot.available
                                    ? "text-gray-900"
                                    : "text-gray-500"
                                }`}
                              >
                                {slot.displayName}
                              </span>
                            </div>
                            {formData.deliveryTimeSlot === slot.slot && (
                              <BadgeCheck size={16} className="text-teal-600" />
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">{slot.time}</span>
                            {slot.available ? (
                              <span className="text-xs text-green-600 font-medium">
                                {slot.capacity} slots left
                              </span>
                            ) : (
                              <span className="text-xs text-red-600 font-medium">
                                {slot.reason || "Unavailable"}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border border-gray-300 bg-gray-50 text-center">
                      <p className="text-sm text-gray-600">No time slots available</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Please check back later or try a different date
                      </p>
                    </div>
                  )}
                </label>
                {formData.deliveryTimeSlot && (
                  <p className="text-xs text-teal-600 mt-2 flex items-center gap-1">
                    <Info size={12} />
                    Selected: {MEAL_TIME_SLOTS[formData.deliveryTimeSlot as MealTimeSlot].displayName} at {MEAL_TIME_SLOTS[formData.deliveryTimeSlot as MealTimeSlot].time}
                  </p>
                )}
              </div>
            </div>

            {/* Note */}
            <label className="flex flex-col flex-1">
              <span className="text-gray-900 text-sm font-semibold pb-2">
                Note for Rider (Optional)
              </span>
              <textarea
                className="w-full rounded-lg border border-gray-300 bg-white min-h-[100px] p-4 text-base focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none transition-all placeholder:text-gray-400 resize-none"
                placeholder="e.g. Leave at the guard post, bell doesn't work..."
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
              ></textarea>
            </label>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="bg-teal-50/50 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-center md:justify-start border border-teal-100">
          <div className="flex items-center gap-2 text-teal-800 text-sm font-medium">
            <ShieldCheck size={18} />
            <span>Hygienic Packaging</span>
          </div>
          <div className="w-px h-4 bg-teal-200 hidden md:block"></div>
          <div className="flex items-center gap-2 text-teal-800 text-sm font-medium">
            <UserCheck size={18} />
            <span>Verified Home Chefs</span>
          </div>
          <div className="w-px h-4 bg-teal-200 hidden md:block"></div>
          <div className="flex items-center gap-2 text-teal-800 text-sm font-medium">
            <Clock size={18} />
            <span>Freshly Cooked</span>
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: SUMMARY --- */}
      <div className="lg:col-span-1 flex flex-col gap-6 sticky top-24">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
          <h3 className="text-gray-900 text-lg font-bold mb-4 border-b border-gray-100 pb-3">
            Order Summary
          </h3>

          {/* Items List */}
          <div className="flex flex-col gap-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 items-start">
                <div className="relative w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  <Image
                    src={
                      item.image || "/placeholder-dish.jpg"
                    }
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col grow">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-gray-900 leading-tight">
                      {item.name}
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      ৳{item.price}
                    </p>
                  </div>
                  <p className="text-xs text-teal-700 font-medium mb-1">
                    by Chef Rahima
                  </p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-3">
              Payment Method
            </h4>
            <div className="relative group">
              <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-teal-600 bg-teal-50 cursor-pointer relative overflow-hidden">
                <input
                  defaultChecked
                  type="radio"
                  name="payment"
                  className="text-teal-600 focus:ring-teal-600 w-5 h-5 accent-teal-600"
                />
                <Banknote className="text-teal-700" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">
                    Cash on Delivery
                  </span>
                  <span className="text-[11px] text-teal-700">
                    Pay when you receive food
                  </span>
                </div>
              </label>

              {/* COD Notice */}
              <div className="mt-2 flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
                <Info size={14} className="shrink-0" />
                <p className="leading-tight">
                  Due to high demand, we are currently accepting Cash on
                  Delivery only.
                </p>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="border-t border-dashed border-gray-300 pt-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>৳{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <div className="flex flex-col">
                <span>Delivery Fee</span>
                {deliveryInfo.distance !== null && (
                  <span className="text-xs text-gray-400">
                    {deliveryInfo.distance.toFixed(2)} km away
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end">
                {loadingDelivery ? (
                  <Loader2 className="animate-spin text-gray-400" size={14} />
                ) : (
                  <>
                    <span className={deliveryInfo.available ? "" : "text-red-600"}>
                      ৳{delivery}
                    </span>
                    {!deliveryInfo.available && (
                      <span className="text-xs text-red-600">Unavailable</span>
                    )}
                  </>
                )}
              </div>
            </div>
            {!deliveryInfo.available && deliveryInfo.error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700 font-medium">{deliveryInfo.error}</p>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 mt-2 border-t border-gray-100">
              <span>Total Payable</span>
              <span className="text-teal-700 text-xl">
                ৳{total}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting || !deliveryInfo.available || loadingDelivery}
            className="mt-6 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Place Order</span>
                <span className="bg-black/10 px-2 py-0.5 rounded text-sm">
                  ৳{total}
                </span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            By placing an order, you agree to our Terms of Service.
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">Need help with your order?</p>
          <button
            type="button"
            className="text-teal-700 font-semibold text-sm hover:underline"
          >
            Contact Support
          </button>
        </div>
      </div>
      {showMap && (
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowMap(false)}
        />
      )}
    </form>
  );
}
