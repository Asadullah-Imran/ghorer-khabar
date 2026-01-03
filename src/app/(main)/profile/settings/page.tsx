import SettingsForm from "@/components/profile/settings/SettingsForm";
import { USER_SETTINGS } from "@/lib/dummy-data/settings";
import { ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-700 transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to Profile
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-3 rounded-xl">
            <Settings className="text-gray-600" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Account Settings
            </h1>
            <p className="text-sm text-gray-500">
              Manage your profile and security
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Form */}
      <SettingsForm initialData={USER_SETTINGS} />
    </div>
  );
}
