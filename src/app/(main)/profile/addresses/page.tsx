import AddressList from "@/components/address/AddressList";
import { SAVED_ADDRESSES } from "@/lib/dummy-data/addresses";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

export default function SavedAddressesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-700 transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to Profile
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-3 rounded-xl">
            <MapPin className="text-blue-600" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Saved Addresses
            </h1>
            <p className="text-sm text-gray-500">Manage delivery locations</p>
          </div>
        </div>
      </div>

      {/* Interactive List */}
      <AddressList initialData={SAVED_ADDRESSES} />
    </div>
  );
}
