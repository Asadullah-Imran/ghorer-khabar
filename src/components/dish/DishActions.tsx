"use client";

import { Minus, Plus, ShieldCheck, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

export default function DishActions({
  id,
  name,
  image,
  price,
}: {
  id: string;
  name: string;
  image?: string;
  price: number;
}) {
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  const increment = () => setQty((prev) => prev + 1);
  const decrement = () => setQty((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-lg shadow-gray-200/50 mt-auto lg:sticky lg:bottom-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-500">Total Price</span>
          <span className="text-2xl font-bold text-gray-900">
            ৳{price * qty}
          </span>
        </div>

        <div className="flex gap-4">
          {/* Quantity */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2">
            <button
              onClick={decrement}
              className="p-2 text-gray-400 hover:text-gray-900 transition"
            >
              <Minus size={18} />
            </button>
            <span className="w-8 text-center font-bold text-gray-900">
              {qty}
            </span>
            <button
              onClick={increment}
              className="p-2 text-gray-400 hover:text-gray-900 transition"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Add Button */}
          <button
            className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg py-3 px-6 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-md"
            onClick={() => addItem({ id, name, image, price }, qty)}
          >
            <ShoppingBag size={20} />
            Add to Cart
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-2">
          <ShieldCheck size={16} />
          <span>Secure checkout powered by Ghorer Khabar</span>
        </div>
      </div>
    </div>
  );
}
