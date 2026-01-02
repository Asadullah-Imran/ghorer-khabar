"use client";

import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Clock,
  Info,
  Loader2,
  ShieldCheck,
  Truck,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPageContent({ userData }: { userData: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: userData.fullName,
    phone: userData.phone,
    address: userData.savedAddress,
    note: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      alert(
        "Order Placed Successfully! (This would redirect to a Success Page)"
      );
      setIsSubmitting(false);
      router.push("/feed"); // Redirect back to feed for now
    }, 2000);
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

            {/* Address */}
            <label className="flex flex-col flex-1">
              <span className="text-gray-900 text-sm font-semibold pb-2">
                Detailed Address
              </span>
              <input
                required
                type="text"
                className="w-full rounded-lg border border-gray-300 bg-white h-12 px-4 text-base focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none transition-all placeholder:text-gray-400"
                placeholder="House No, Road No, Area..."
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </label>

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
            {userData.cartSummary.items.map((item: any) => (
              <div key={item.id} className="flex gap-3 items-start">
                <div className="relative w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  <Image
                    src={item.image}
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
                  <p className="text-xs text-gray-500">Qty: {item.qty}</p>
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
              <span>৳{userData.cartSummary.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Delivery Fee</span>
              <span>৳{userData.cartSummary.delivery}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 mt-2 border-t border-gray-100">
              <span>Total Payable</span>
              <span className="text-teal-700 text-xl">
                ৳{userData.cartSummary.total}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
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
                  ৳{userData.cartSummary.total}
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
    </form>
  );
}
