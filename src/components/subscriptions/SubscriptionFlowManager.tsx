"use client";

import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LocationPicker from "@/components/profile/address/LocationPicker";
import { MapPin, Info, Loader2 } from "lucide-react";

interface SubscriptionFlowManagerProps {
  planId: string;
  planName: string;
  planPrice: number;
  chefName: string;
  chefQuote?: string;
  kitchenArea?: string;
  mealsPerDay: number;
  servingsPerMeal: number;
  isOwnKitchen?: boolean;
  kitchenId?: string;
}

export default function SubscriptionFlowManager({
  planId,
  planName,
  planPrice,
  chefName,
  chefQuote,
  kitchenArea,
  mealsPerDay,
  servingsPerMeal,
  isOwnKitchen = false,
  kitchenId,
}: SubscriptionFlowManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  // Address state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Delivery charge state
  const [deliveryInfo, setDeliveryInfo] = useState<{
    distance: number | null;
    charge: number | null;
    available: boolean;
    error?: string;
  }>({
    distance: null,
    charge: 300, // Default fallback
    available: true,
  });
  const [loadingDelivery, setLoadingDelivery] = useState(false);

  // Form state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [useChefContainers, setUseChefContainers] = useState(true);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

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
            setSelectedAddressId(defaultAddr.id);
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

  // Fetch delivery charge when address or kitchen changes
  useEffect(() => {
    const fetchDeliveryCharge = async () => {
      if (!kitchenId) {
        setDeliveryInfo({
          distance: null,
          charge: 300,
          available: true,
        });
        return;
      }

      // If addressId is available, use it
      if (selectedAddressId) {
        try {
          setLoadingDelivery(true);
          const response = await fetch(
            `/api/orders/calculate-delivery?kitchenId=${kitchenId}&addressId=${selectedAddressId}`
          );

          if (response.ok) {
            const data = await response.json();
            setDeliveryInfo(data.data);
          } else {
            const errorData = await response.json();
            setDeliveryInfo({
              distance: null,
              charge: 300,
              available: false,
              error: errorData.error || "Failed to calculate delivery charge",
            });
          }
        } catch (error) {
          console.error("Failed to fetch delivery charge:", error);
          setDeliveryInfo({
            distance: null,
            charge: 300,
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
              charge: 300,
              available: false,
              error: errorData.error || "Failed to calculate delivery charge",
            });
          }
        } catch (error) {
          console.error("Failed to fetch delivery charge:", error);
          setDeliveryInfo({
            distance: null,
            charge: 300,
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
          charge: 300,
          available: true,
        });
      }
    };

    fetchDeliveryCharge();
  }, [kitchenId, selectedAddressId, selectedLocation]);

  // Calculate pricing
  const deliveryFee = deliveryInfo.charge ?? 300; // Use calculated charge or fallback
  const discount = 0;
  const totalAmount = planPrice + deliveryFee - discount;

  const handleLocationSelect = async (lat: number, lng: number, address?: string) => {
    setSelectedLocation({ lat, lng });
    setSelectedAddressId(""); // Clear address selection when using map
  };

  const handleSubscribeClick = () => {
    setIsOpen(true);
    setCurrentStep(1);
    // Default to next Saturday
    const nextSaturday = getNextSaturday();
    setStartDate(nextSaturday);
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentStep(1);
    setDeliveryInstructions("");
    setUseChefContainers(true);
    setAgreedToPolicy(false);
  };

  const handleStepOneContinue = () => {
    if (!startDate) {
      toast.warning("Date Required", "Please select a start date");
      return;
    }
    if (!agreedToPolicy) {
      toast.warning("Policy Agreement Required", "Please agree to the allergen policy");
      return;
    }
    if (!selectedAddressId && !selectedLocation) {
      toast.warning("Address Required", "Please select a delivery address with location");
      return;
    }
    if (!deliveryInfo.available) {
      toast.error(
        "Delivery Unavailable", 
        deliveryInfo.error || "Delivery is not available for this distance. Please select a different address."
      );
      return;
    }
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handlePlaceOrder = async () => {
    if (!startDate) return;

    if (!selectedAddressId && !selectedLocation) {
      toast.error("Address Required", "Please select a delivery address with location");
      return;
    }

    if (!deliveryInfo.available) {
      toast.error(
        "Delivery Unavailable", 
        deliveryInfo.error || "Delivery is not available for this distance. Please select a different address."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          planId,
          startDate: startDate.toISOString(),
          deliveryInstructions,
          useChefContainers,
          addressId: selectedAddressId || undefined,
          deliveryLat: selectedLocation?.lat,
          deliveryLng: selectedLocation?.lng,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        handleClose();
        toast.success("Subscription Created!", "Redirecting to confirmation page...");
        router.push(data.redirectUrl);
      } else {
        toast.error("Subscription Failed", data.error || "Failed to create subscription");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Network Error", "Failed to create subscription. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Subscribe Button */}
      {isOwnKitchen ? (
        <div className="w-full py-3 bg-gray-300 text-gray-600 font-bold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed">
          <span>Your Own Plan</span>
        </div>
      ) : (
        <button
          onClick={handleSubscribeClick}
          className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
        >
          <span>Subscribe</span>
        </button>
      )}

      {/* Modal Overlay */}
{isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[520px] max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* STEP 1: Setup */}
            {currentStep === 1 && (
              <>
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Subscription Setup</h2>
                    <button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <p className="text-teal-700 text-sm font-bold uppercase">Step 1 of 2: Preferences</p>
                      <p className="text-gray-500 text-xs font-medium">50% Completed</p>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-700 w-1/2 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* Date Picker */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-700">calendar_month</span>
                      <h3 className="text-lg font-bold text-gray-900">Select Start Date</h3>
                    </div>
                    <p className="text-sm text-gray-500 -mt-2 ml-8">Plans typically start on Saturdays.</p>
                    <input
                      type="date"
                      value={startDate ? startDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setStartDate(new Date(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                    />
                  </div>

                  {/* Address Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-700">location_on</span>
                      <h3 className="text-lg font-bold text-gray-900">Delivery Address</h3>
                    </div>
                    
                    {/* Saved Addresses List */}
                    {!loadingAddresses && addresses.length > 0 && (
                      <div className="grid grid-cols-1 gap-3 mb-2">
                        {addresses.map((addr) => (
                          <div 
                            key={addr.id}
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              setSelectedLocation(null); // Clear map selection
                            }}
                            className={`p-3 rounded-lg border-2 cursor-pointer flex items-start gap-3 transition-colors ${
                              selectedAddressId === addr.id 
                              ? "border-teal-600 bg-teal-50/50" 
                              : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              selectedAddressId === addr.id ? "border-teal-600" : "border-gray-300"
                            }`}>
                              {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{addr.label}</p>
                              <p className="text-xs text-gray-500 line-clamp-2">{addr.address}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Map Picker Button */}
                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-700 font-medium"
                    >
                      <MapPin size={18} />
                      <span>Pick Location from Map</span>
                    </button>

                    {!selectedAddressId && !selectedLocation && (
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        <Info size={12} />
                        Select a saved address or use the map to get accurate delivery charges
                      </p>
                    )}

                    {/* Delivery Info Display */}
                    {deliveryInfo.distance !== null && (
                      <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Distance</span>
                          <span className="text-sm font-semibold text-teal-700">
                            {deliveryInfo.distance.toFixed(2)} km
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-700">Delivery Fee</span>
                          {loadingDelivery ? (
                            <Loader2 className="animate-spin text-gray-400" size={14} />
                          ) : (
                            <span className={`text-sm font-bold ${deliveryInfo.available ? "text-teal-700" : "text-red-600"}`}>
                              ৳{deliveryFee}
                            </span>
                          )}
                        </div>
                        {!deliveryInfo.available && deliveryInfo.error && (
                          <p className="text-xs text-red-600 mt-2">{deliveryInfo.error}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-700">edit_note</span>
                      <h3 className="text-lg font-bold text-gray-900">Delivery Instructions</h3>
                    </div>
                    <textarea
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="Code for gate, leave at reception, guard details..."
                      className="w-full min-h-[100px] px-4 py-3 border border-gray-300 rounded-xl focus:border-teal-700 focus:ring-1 focus:ring-teal-700 resize-none"
                    />
                  </div>

                  {/* Tiffin Preference */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-700">lunch_dining</span>
                      <h3 className="text-lg font-bold text-gray-900">Tiffin Preference</h3>
                    </div>
                    <div className="flex items-center gap-4 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex-1">
                        <p className="text-gray-900 text-base font-semibold">Use Chef's Containers</p>
                        <p className="text-gray-500 text-xs">Standard disposable containers (Free)</p>
                      </div>
                      <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-gray-200 p-0.5 has-[:checked]:justify-end has-[:checked]:bg-teal-700">
                        <div className="h-full w-[27px] rounded-full bg-white shadow-sm"></div>
                        <input
                          type="checkbox"
                          checked={useChefContainers}
                          onChange={(e) => setUseChefContainers(e.target.checked)}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 ml-2">Toggle off to use your own steel tiffin (Eco-friendly).</p>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-amber-50 p-6 pt-8 rounded-lg shadow-sm border border-amber-100">
                    <div className="flex items-center justify-between pb-4 border-b border-dashed border-gray-300 mb-4">
                      <h3 className="text-lg font-bold text-gray-800">Order Summary</h3>
                      <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                        Cash on Delivery
                      </span>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{planName} (1 Month)</span>
                        <span className="font-medium text-gray-900">৳ {planPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div className="flex flex-col">
                          <span className="text-gray-600">Delivery Fees</span>
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
                              <span className={`font-medium ${deliveryInfo.available ? "text-gray-900" : "text-red-600"}`}>
                                ৳ {deliveryFee}
                              </span>
                              {!deliveryInfo.available && (
                                <span className="text-xs text-red-600">Unavailable</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {!deliveryInfo.available && deliveryInfo.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-700">{deliveryInfo.error}</p>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Chef's Discount</span>
                        <span className="font-medium text-green-600">- ৳ {discount}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t border-gray-300">
                      <div>
                        <span className="text-xs text-gray-500">Total Amount</span>
                        <span className="block text-2xl font-bold text-gray-900">৳ {totalAmount}</span>
                      </div>
                      <p className="text-xs text-gray-500 max-w-[150px] text-right">Pay securely upon first delivery</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreedToPolicy}
                      onChange={(e) => setAgreedToPolicy(e.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-teal-700 focus:ring-teal-700 mt-0.5"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">
                      I agree to the <a href="#" className="text-teal-700 hover:underline font-medium">Allergen Policy</a> and acknowledge that meals may contain traces of nuts or dairy.
                    </span>
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-900 font-bold hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStepOneContinue}
                      className="flex-[2] px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-lg flex items-center justify-center gap-2"
                    >
                      <span>Continue</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: Summary */}
            {currentStep === 2 && (
              <>
                {/* Header */}
                <div className="px-8 pt-8 pb-2 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Finalize Your Subscription</h2>
                      <p className="text-gray-500 text-sm mt-1">Review your meal plan and confirm payment details.</p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                  </div>
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-teal-700 text-sm font-bold uppercase">Step 2 of 2</span>
                      <span className="text-gray-400 text-xs font-medium">Summary & Payment</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-700 w-full rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
                  {/* Plan Summary */}
                  <div className="space-y-4">
                    <h3 className="text-gray-900 text-lg font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-700">inventory_2</span>
                      Plan Summary
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <div className="grid grid-cols-[120px_1fr] gap-y-4 gap-x-6">
                        <p className="text-gray-500 text-sm font-medium">Plan Name</p>
                        <p className="text-gray-900 text-sm font-bold">{planName}</p>
                        <div className="col-span-2 h-px bg-gray-200"></div>
                        <p className="text-gray-500 text-sm font-medium">Start Date</p>
                        <p className="text-gray-900 text-sm font-semibold">
                          {startDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {deliveryInstructions && (
                          <>
                            <div className="col-span-2 h-px bg-gray-200"></div>
                            <p className="text-gray-500 text-sm font-medium">Instructions</p>
                            <p className="text-gray-900 text-sm font-medium italic">"{deliveryInstructions}"</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Chef's Message */}
                  {chefQuote && (
                    <div className="bg-teal-700/5 p-4 rounded-xl border border-teal-700/10">
                      <p className="text-gray-700 text-sm leading-relaxed font-medium">
                        "{chefQuote}"
                      </p>
                      <p className="text-teal-700 text-xs font-bold mt-2 uppercase">— {chefName}</p>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="space-y-4">
                    <h3 className="text-gray-900 text-lg font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-700">receipt_long</span>
                      Price Breakdown
                    </h3>
                    <div className="space-y-3 px-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Monthly Subscription (4 weeks)</span>
                        <span className="text-gray-900 font-medium">৳{planPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div className="flex flex-col">
                          <span className="text-gray-600">Delivery Fee</span>
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
                              <span className={`font-medium ${deliveryInfo.available ? "text-gray-900" : "text-red-600"}`}>
                                ৳{deliveryFee}
                              </span>
                              {!deliveryInfo.available && (
                                <span className="text-xs text-red-600">Unavailable</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {!deliveryInfo.available && deliveryInfo.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-700">{deliveryInfo.error}</p>
                        </div>
                      )}
                      <div className="h-px bg-gray-200"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 text-base font-bold">Total Amount to be Paid</span>
                        <span className="text-teal-700 text-2xl font-black">৳{totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* COD Notice */}
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 flex gap-4 items-start">
                    <div className="bg-white p-2.5 rounded-lg shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-orange-500 text-2xl">payments</span>
                    </div>
                    <div>
                      <h4 className="text-gray-900 font-bold text-base">Cash on Delivery Information</h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Payment will be collected by the runner on the <span className="font-bold">first delivery</span> of each week/month. Please keep exact change ready.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100">
                  <div className="flex gap-4">
                    <button
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 px-6 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-50"
                    >
                      Back to Edit
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting || !deliveryInfo.available || loadingDelivery}
                      className="flex-[2] py-3.5 px-6 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:bg-gray-400 disabled:hover:bg-gray-400"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Place Subscription Order</span>
                          <span className="material-symbols-outlined">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Location Picker Modal */}
      {showMap && (
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowMap(false)}
        />
      )}
    </>
  );
}

function getNextSaturday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
  const nextSaturday = new Date(today);
  nextSaturday.setDate(today.getDate() + daysUntilSaturday);
  return nextSaturday;
}
