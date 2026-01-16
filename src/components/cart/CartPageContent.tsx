"use client";

import { useCart } from "@/components/cart/CartProvider";
import {
    ArrowRight,
    BadgeCheck,
    Info,
    Loader2,
    Minus,
    Plus,
    Star,
    Trash2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function CartPageContent() {
  const {
    items,
    incrementItem,
    removeItem,
    removeItemsByKitchen,
    clearCart,
    isInitialized,
  } = useCart();
  const router = useRouter();

  // Show loading while initializing
  if (!isInitialized) {
      return (
          <div className="flex justify-center items-center min-h-[50vh]">
              <Loader2 className="animate-spin text-teal-600" size={40} />
          </div>
      );
  }

  // Group items by kitchen
  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof items> = {};
    items.forEach(item => {
        const kId = item.kitchenId || "unknown";
        if (!groups[kId]) groups[kId] = [];
        groups[kId].push(item);
    });
    return groups;
  }, [items]);

  // Calculate totals per kitchen
  const getGroupTotal = (groupItems: typeof items) => {
      return groupItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  const handleCheckout = (kitchenId: string) => {
      router.push(`/checkout?kitchenId=${kitchenId}`);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <Trash2 size={48} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500 mt-2 mb-6">
          Looks like you haven't added anything yet.
        </p>
        <Link
          href="/feed"
          className="bg-teal-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-teal-800 transition"
        >
          Start Ordering
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
        <div className="flex justify-end">
            <button
               onClick={clearCart}
               className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors px-4 py-2 bg-red-50 rounded-lg"
             >
               <Trash2 size={16} /> Clear All Carts
             </button>
        </div>

        {Object.entries(groupedItems).map(([kitchenId, groupItems]) => {
            console.log("kitchenId", kitchenId);
            console.log("groupItems", groupItems);
            const kitchenName = groupItems[0]?.kitchenName || "Unknown Kitchen";
            const subtotal = getGroupTotal(groupItems);
            const deliveryFee = 60; // Fixed for now per kitchen
            const total = subtotal + deliveryFee;

            return (
                <div key={kitchenId} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-t pt-8 first:border-t-0 first:pt-0">
                    {/* LEFT: Items for this kitchen */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                         {/* Header Section */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                          <div className="flex items-center gap-4 mb-4 border-b border-gray-100 pb-4">
                              <div className="relative h-12 w-12 rounded-full overflow-hidden border border-gray-100 bg-gray-100">
                                {/* Placeholder since we don't have kitchen image in cart item yet */}
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs font-bold">
                                    {kitchenName.substring(0,2).toUpperCase()}
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-gray-900 text-lg font-bold leading-tight flex items-center gap-2">
                                    {kitchenName}
                                    <BadgeCheck size={18} className="text-teal-600" />
                                </h3>
                                {(groupItems[0]?.kitchenLocation || groupItems[0]?.kitchenRating) && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                        {groupItems[0]?.kitchenRating && (
                                            <div className="flex items-center gap-1 text-yellow-500 font-medium">
                                                <Star size={12} fill="currentColor" />
                                                {groupItems[0].kitchenRating}
                                                <span className="text-gray-400">({groupItems[0].kitchenReviewCount || 0})</span>
                                            </div>
                                        )}
                                        {groupItems[0]?.kitchenLocation && (
                                            <>
                                                {groupItems[0]?.kitchenRating && <span>•</span>}
                                                <span>{groupItems[0].kitchenLocation}</span>
                                            </>
                                        )}
                                    </div>
                                )}
                              </div>
                              <button
                                onClick={() => removeItemsByKitchen(kitchenId)}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                                title="Clear items from this kitchen"
                              >
                                  <Trash2 size={18} />
                              </button>
                          </div>

                           {/* Alert */}
                          <div className="flex gap-3 bg-teal-50 rounded-lg p-3 items-start">
                            <Info size={18} className="text-teal-700 mt-0.5" />
                            <p className="text-teal-800 text-sm font-medium">
                              Individual Order: These items will be prepared by {kitchenName}.
                            </p>
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="flex flex-col gap-4">
                            {groupItems.map((item) => (
                                <div key={item.id} className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200 items-center justify-between">
                                     <div className="flex items-start gap-4 flex-1 w-full">
                                         <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                            <Image
                                                src={item.image || "/placeholder-dish.jpg"}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                         </div>
                                         <div className="flex flex-col justify-center gap-1">
                                             <p className="text-gray-900 font-bold">{item.name}</p>
                                             <p className="text-teal-700 font-semibold text-sm">৳{item.price}</p>
                                         </div>
                                     </div>

                                     <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8">
                                         <div className="flex items-center gap-3">
                                            <button onClick={() => incrementItem(item.id, -1)} disabled={item.quantity <= 1} className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50">
                                                <Minus size={14} />
                                            </button>
                                            <span className="font-semibold w-6 text-center">{item.quantity}</span>
                                            <button onClick={() => incrementItem(item.id, 1)} className="p-1 rounded-full bg-gray-100 hover:bg-gray-200">
                                                <Plus size={14} />
                                            </button>
                                         </div>
                                         <p className="font-bold min-w-[60px] text-right">৳{item.price * item.quantity}</p>
                                         <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500">
                                             <Trash2 size={18} />
                                         </button>
                                     </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Summary for this kitchen */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col gap-4">
                            <h4 className="font-bold text-gray-900 border-b pb-2">Order Summary</h4>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span>
                                <span>৳{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Delivery Fee</span>
                                <span>৳{deliveryFee}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
                                <span>Total</span>
                                <span className="text-teal-700">৳{total}</span>
                            </div>

                            <button
                                onClick={() => handleCheckout(kitchenId)}
                                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                Checkout from {kitchenName} <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
  );
}
