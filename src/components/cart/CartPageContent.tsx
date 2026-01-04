"use client";

import { useCart } from "@/components/cart/CartProvider";
import {
  ArrowRight,
  BadgeCheck,
  Info,
  Minus,
  Plus,
  PlusCircle,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

// Types
type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  tags?: string[];
  tagColors?: string[];
};

type CartData = {
  kitchen: any;
  fees: any;
  items: CartItem[];
};

export default function CartPageContent({
  initialData,
}: {
  initialData: CartData;
}) {
  const [localItems, setLocalItems] = useState<CartItem[]>(initialData.items);
  const {
    items: dynamicItems,
    incrementItem,
    removeItem: removeDynamicItem,
    clearCart: clearDynamicCart,
  } = useCart();

  const mergedItems: CartItem[] = useMemo(() => {
    const byId: Record<string, CartItem> = {};
    for (const item of localItems) {
      byId[item.id] = { ...item };
    }
    for (const d of dynamicItems) {
      const existing = byId[d.id];
      if (existing) {
        byId[d.id] = {
          ...existing,
          quantity: existing.quantity + d.quantity,
          // Prefer dynamic image/name/price if provided
          name: d.name ?? existing.name,
          price: d.price ?? existing.price,
          image: d.image ?? existing.image,
        };
      } else {
        byId[d.id] = {
          id: d.id,
          name: d.name,
          price: d.price,
          quantity: d.quantity,
          image: d.image,
          tags: [],
          tagColors: [],
        };
      }
    }
    return Object.values(byId);
  }, [localItems, dynamicItems]);

  // --- LOGIC ---
  const updateQty = (id: string, delta: number) => {
    const isDynamic = dynamicItems.some((i) => i.id === id);
    if (isDynamic) {
      incrementItem(id, delta);
    } else {
      setLocalItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
      );
    }
  };

  const removeItem = (id: string) => {
    const isDynamic = dynamicItems.some((i) => i.id === id);
    if (isDynamic) {
      removeDynamicItem(id);
    } else {
      setLocalItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const clearCart = () => {
    setLocalItems([]);
    clearDynamicCart();
  };

  // --- CALCULATIONS ---
  const subtotal = mergedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const deliveryFee = mergedItems.length > 0 ? initialData.fees.delivery : 0;
  const platformFee = mergedItems.length > 0 ? initialData.fees.platform : 0;
  const total = subtotal + deliveryFee + platformFee;

  // --- UI ---
  if (mergedItems.length === 0) {
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* --- LEFT COLUMN: ITEMS --- */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden border border-gray-100">
                <Image
                  src={initialData.kitchen.image}
                  alt="Chef"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-gray-900 text-lg font-bold leading-tight">
                    {initialData.kitchen.name}
                  </h3>
                  <BadgeCheck size={18} className="text-teal-600" />
                </div>
                <p className="text-gray-500 text-sm">
                  {initialData.kitchen.location} •{" "}
                  <span className="text-amber-500 font-medium">
                    ★ {initialData.kitchen.rating}
                  </span>{" "}
                  ({initialData.kitchen.reviews} reviews)
                </p>
              </div>
            </div>
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <Trash2 size={16} /> Clear Cart
            </button>
          </div>

          {/* Alert */}
          <div className="flex gap-3 bg-teal-50 rounded-lg p-3 items-start">
            <Info size={18} className="text-teal-700 mt-0.5" />
            <p className="text-teal-800 text-sm font-medium">
              Single-source cart: All items are fulfilled by{" "}
              {initialData.kitchen.name} to ensure freshness.
            </p>
          </div>
        </div>

        {/* Items List */}
        <div className="flex flex-col gap-4">
          {mergedItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200 items-start sm:items-center justify-between"
            >
              {/* Item Info */}
              <div className="flex items-start gap-4 flex-1">
                <div className="relative h-20 w-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                  <Image
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200&auto=format"
                    }
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center gap-1">
                  <p className="text-gray-900 text-base font-bold leading-normal">
                    {item.name}
                  </p>
                  <p className="text-teal-700 font-semibold text-sm">
                    ৳{item.price}
                  </p>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex gap-2 mt-1">
                      {item.tags.map((tag, i) => {
                        const color = item.tagColors?.[i] || "gray";
                        return (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded text-xs font-medium bg-${color}-100 text-${color}-700`}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8 mt-2 sm:mt-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    disabled={item.quantity <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-lg font-medium text-gray-900 disabled:opacity-50"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-gray-900 font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-lg font-medium text-gray-900"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-gray-900 font-bold text-base min-w-[70px] text-right">
                    ৳{item.price * item.quantity}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add More Button */}
          <Link
            href={`/kitchen/${initialData.kitchen.id}`}
            className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-teal-600 hover:text-teal-600 transition-all group"
          >
            <PlusCircle className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">
              Add more items from {initialData.kitchen.name}
            </span>
          </Link>
        </div>
      </div>

      {/* --- RIGHT COLUMN: SUMMARY --- */}
      <div className="lg:col-span-4 sticky top-24">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col gap-6">
          <h3 className="text-gray-900 text-xl font-bold">Order Summary</h3>

          <div className="flex flex-col gap-3 pb-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-sm">
                Subtotal ({mergedItems.length} items)
              </p>
              <p className="text-gray-900 font-medium">৳{subtotal}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-sm">Delivery Fee</p>
              <p className="text-gray-900 font-medium">৳{deliveryFee}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-sm">Platform Fee</p>
              <p className="text-gray-900 font-medium">৳{platformFee}</p>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-gray-900 text-lg font-bold">Total</p>
              <p className="text-teal-700 text-xl font-black">৳{total}</p>
            </div>
          </div>

          {/* Promo Code removed per request */}

          {/* Checkout Button */}
          <Link
            href="/checkout"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-base py-3.5 px-6 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={20} />
          </Link>

          <p className="text-center text-xs text-gray-400">
            By proceeding, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
