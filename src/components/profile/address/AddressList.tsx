"use client";

import { Briefcase, Home, MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function AddressList({ initialData }: { initialData: any[] }) {
  const [addresses, setAddresses] = useState(initialData);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this address?")) {
      setAddresses(addresses.filter((addr) => addr.id !== id));
    }
  };

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handleAdd = () => {
    const newAddr = prompt("Enter new address details:");
    if (newAddr) {
      setAddresses([
        ...addresses,
        {
          id: `new_${Date.now()}`,
          label: "New Address",
          value: newAddr,
          isDefault: false,
        },
      ]);
    }
  };

  // Helper to pick icon based on label
  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("home")) return <Home size={20} />;
    if (l.includes("office") || l.includes("work"))
      return <Briefcase size={20} />;
    return <MapPin size={20} />;
  };

  return (
    <div className="space-y-4">
      {addresses.map((addr) => (
        <div
          key={addr.id}
          className={`relative p-5 rounded-xl border flex items-start gap-4 transition-all ${
            addr.isDefault
              ? "border-teal-500 bg-teal-50/50 shadow-sm"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          {/* Icon */}
          <div
            className={`p-3 rounded-full ${
              addr.isDefault
                ? "bg-teal-100 text-teal-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {getIcon(addr.label)}
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3
                  className={`font-bold ${
                    addr.isDefault ? "text-teal-900" : "text-gray-900"
                  }`}
                >
                  {addr.label}
                </h3>
                {addr.isDefault && (
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200">
                    Default
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-semibold text-gray-500 hover:text-teal-700 px-2 py-1 rounded hover:bg-gray-100"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              {addr.value}
            </p>
          </div>
        </div>
      ))}

      {/* Add New Button */}
      <button
        onClick={handleAdd}
        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 font-bold hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50 transition-all"
      >
        <Plus size={20} />
        Add New Address
      </button>
    </div>
  );
}
