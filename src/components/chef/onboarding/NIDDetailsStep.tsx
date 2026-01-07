"use client";

import { CreditCard, Phone } from "lucide-react";

interface NIDDetailsStepProps {
  nidName: string;
  phone: string;
  onNidNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  errors?: { nidName?: string; phone?: string };
}

export default function NIDDetailsStep({
  nidName,
  phone,
  onNidNameChange,
  onPhoneChange,
  errors,
}: NIDDetailsStepProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="bg-[#477e77]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="text-[#477e77]" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-[#1b0e0e]">Personal Details</h2>
        <p className="text-gray-600">
          We need your NID information for verification
        </p>
      </div>

      <div className="space-y-4">
        {/* NID Name Field */}
        <div className="space-y-2">
          <label
            htmlFor="nidName"
            className="block text-sm font-medium text-gray-700"
          >
            Name (as per NID) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nidName"
            value={nidName}
            onChange={(e) => onNidNameChange(e.target.value)}
            placeholder="Enter your full name as it appears on your NID"
            className={`
              w-full px-4 py-3 rounded-lg border-2 transition-colors
              focus:outline-none focus:ring-2 focus:ring-[#477e77]/20
              ${
                errors?.nidName
                  ? "border-red-500"
                  : "border-gray-200 focus:border-[#477e77]"
              }
            `}
          />
          {errors?.nidName && (
            <p className="text-sm text-red-500">{errors.nidName}</p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Phone size={18} />
            </div>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
                if (value.startsWith("880")) {
                  value = value.slice(3);
                }
                if (value.startsWith("0")) {
                  value = value.slice(1);
                }
                onPhoneChange(value);
              }}
              placeholder="1XXXXXXXXX"
              className={`
                w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-colors
                focus:outline-none focus:ring-2 focus:ring-[#477e77]/20
                ${
                  errors?.phone
                    ? "border-red-500"
                    : "border-gray-200 focus:border-[#477e77]"
                }
              `}
            />
          </div>
          <p className="text-xs text-gray-500">
            Format: 1XXXXXXXXX (11 digits starting with 1)
          </p>
          {errors?.phone && (
            <p className="text-sm text-red-500">{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="bg-[#feb728]/10 border border-[#feb728]/30 rounded-lg p-4">
        <h3 className="font-semibold text-sm text-[#1b0e0e] mb-2">
          🔒 Your information is secure
        </h3>
        <p className="text-sm text-gray-700">
          We require NID verification to ensure food safety and build trust with
          customers. Your personal information is encrypted and stored securely.
        </p>
      </div>
    </div>
  );
}
