"use client";

import {
  Briefcase,
  Edit2,
  Home,
  Loader2,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import AddressForm, { AddressFormData } from "./AddressForm";

interface Address {
  id: string;
  label: string;
  address: string;
  zone: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
}

export default function AddressList() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Fetch addresses
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/addresses");

      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const data = await response.json();
      console.log("Fetched addresses data:", data);
      console.log("Addresses array:", data.addresses);
      console.log("Number of addresses:", data.addresses?.length);
      setAddresses(data.addresses);
    } catch (err: any) {
      console.error("Error fetching addresses:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this address?")) {
      return;
    }

    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      setAddresses(addresses.filter((addr) => addr.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to set default address");
      }

      // Update local state
      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
        }))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (data: AddressFormData) => {
    if (editingAddress) {
      // Update existing address
      const response = await fetch(`/api/addresses/${editingAddress.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update address");
      }

      await fetchAddresses();
      setEditingAddress(null);
    } else {
      // Create new address
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create address");
      }

      await fetchAddresses();
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  // Convert Address to AddressFormData for editing
  const getFormData = (
    address: Address | null
  ): AddressFormData | undefined => {
    if (!address) return undefined;
    return {
      id: address.id,
      label: address.label,
      address: address.address,
      zone: address.zone || "",
      latitude: address.latitude,
      longitude: address.longitude,
      isDefault: address.isDefault,
    };
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  // Helper to pick icon based on label
  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("home")) return <Home size={20} />;
    if (l.includes("office") || l.includes("work"))
      return <Briefcase size={20} />;
    return <MapPin size={20} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="animate-spin text-brand-teal" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`relative p-5 rounded-xl border flex items-start gap-4 transition-all ${
              addr.isDefault
                ? "border-brand-teal bg-brand-teal/5 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            {/* Icon */}
            <div
              className={`p-3 rounded-full ${
                addr.isDefault
                  ? "bg-brand-teal/10 text-brand-teal"
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
                      addr.isDefault ? "text-brand-teal" : "text-gray-900"
                    }`}
                  >
                    {addr.label}
                  </h3>
                  {addr.isDefault && (
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-brand-teal bg-white px-2 py-0.5 rounded border border-brand-teal/20">
                      Default
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs font-semibold text-gray-500 hover:text-brand-teal px-2 py-1 rounded hover:bg-gray-100"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(addr)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {addr.address}
              </p>

              {addr.zone && (
                <p className="text-xs text-gray-500 mt-1">Zone: {addr.zone}</p>
              )}

              {addr.latitude && addr.longitude && (
                <p className="text-xs text-gray-400 mt-1">
                  📍 {addr.latitude.toFixed(6)}, {addr.longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <MapPin size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold">No saved addresses yet</p>
            <p className="text-sm mt-1">
              Add your first address to get started
            </p>
          </div>
        )}

        {/* Add New Button */}
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 font-bold hover:border-brand-teal hover:text-brand-teal hover:bg-brand-teal/5 transition-all"
        >
          <Plus size={20} />
          Add New Address
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <AddressForm
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          initialData={getFormData(editingAddress)}
        />
      )}
    </>
  );
}
