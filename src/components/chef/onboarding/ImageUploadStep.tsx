"use client";

import { useToast } from "@/contexts/ToastContext";
import {
    CreditCard,
    Image as ImageIcon,
    Loader2,
    Upload,
    X,
} from "lucide-react";
import { useState } from "react";

interface ImageUploadStepProps {
  nidFrontImage: string | null;
  nidBackImage: string | null;
  kitchenImages: string[];
  onNidFrontUpload: (url: string) => void;
  onNidBackUpload: (url: string) => void;
  onKitchenImageUpload: (url: string) => void;
  onKitchenImageRemove: (index: number) => void;
  errors?: { nidFront?: string; nidBack?: string; kitchen?: string };
}

export default function ImageUploadStep({
  nidFrontImage,
  nidBackImage,
  kitchenImages,
  onNidFrontUpload,
  onNidBackUpload,
  onKitchenImageUpload,
  onKitchenImageRemove,
  errors,
}: ImageUploadStepProps) {
  const [uploadingNidFront, setUploadingNidFront] = useState(false);
  const [uploadingNidBack, setUploadingNidBack] = useState(false);
  const [uploadingKitchen, setUploadingKitchen] = useState(false);
  const toast = useToast();

  const handleFileUpload = async (
    file: File,
    bucket: "nid-documents" | "kitchen-images",
    onSuccess: (url: string) => void,
    setLoading: (loading: boolean) => void
  ) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      onSuccess(data.url);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload Failed", error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="bg-[#477e77]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="text-[#477e77]" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-[#1b0e0e]">
          Upload Documents & Photos
        </h2>
        <p className="text-gray-600">
          Help us verify your identity and showcase your kitchen
        </p>
      </div>

      {/* NID Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard size={20} />
          National ID (NID) Photos
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* NID Front */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              NID Front <span className="text-red-500">*</span>
            </label>
            {nidFrontImage ? (
              <div className="relative group">
                <img
                  src={nidFrontImage}
                  alt="NID Front"
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  onClick={() => onNidFrontUpload("")}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#477e77] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingNidFront}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(
                        file,
                        "nid-documents",
                        onNidFrontUpload,
                        setUploadingNidFront
                      );
                    }
                  }}
                />
                <div className="h-full flex flex-col items-center justify-center gap-2">
                  {uploadingNidFront ? (
                    <>
                      <Loader2
                        className="text-[#477e77] animate-spin"
                        size={32}
                      />
                      <span className="text-sm text-gray-500">
                        Uploading...
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="text-gray-400" size={32} />
                      <span className="text-sm text-gray-500">
                        Click to upload
                      </span>
                    </>
                  )}
                </div>
              </label>
            )}
            {errors?.nidFront && (
              <p className="text-sm text-red-500">{errors.nidFront}</p>
            )}
          </div>

          {/* NID Back */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              NID Back <span className="text-red-500">*</span>
            </label>
            {nidBackImage ? (
              <div className="relative group">
                <img
                  src={nidBackImage}
                  alt="NID Back"
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  onClick={() => onNidBackUpload("")}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#477e77] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingNidBack}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(
                        file,
                        "nid-documents",
                        onNidBackUpload,
                        setUploadingNidBack
                      );
                    }
                  }}
                />
                <div className="h-full flex flex-col items-center justify-center gap-2">
                  {uploadingNidBack ? (
                    <>
                      <Loader2
                        className="text-[#477e77] animate-spin"
                        size={32}
                      />
                      <span className="text-sm text-gray-500">
                        Uploading...
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="text-gray-400" size={32} />
                      <span className="text-sm text-gray-500">
                        Click to upload
                      </span>
                    </>
                  )}
                </div>
              </label>
            )}
            {errors?.nidBack && (
              <p className="text-sm text-red-500">{errors.nidBack}</p>
            )}
          </div>
        </div>
      </div>

      {/* Kitchen Images Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ImageIcon size={20} />
          Kitchen Photos (1-4 images)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kitchenImages.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Kitchen ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                onClick={() => onKitchenImageRemove(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}

          {kitchenImages.length < 4 && (
            <label className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#477e77] transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingKitchen}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(
                      file,
                      "kitchen-images",
                      onKitchenImageUpload,
                      setUploadingKitchen
                    );
                  }
                }}
              />
              <div className="h-full flex flex-col items-center justify-center gap-1">
                {uploadingKitchen ? (
                  <>
                    <Loader2
                      className="text-[#477e77] animate-spin"
                      size={24}
                    />
                    <span className="text-xs text-gray-500">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="text-gray-400" size={24} />
                    <span className="text-xs text-gray-500">Add photo</span>
                  </>
                )}
              </div>
            </label>
          )}
        </div>
        {errors?.kitchen && (
          <p className="text-sm text-red-500">{errors.kitchen}</p>
        )}
      </div>

      <div className="bg-[#feb728]/10 border border-[#feb728]/30 rounded-lg p-4">
        <h3 className="font-semibold text-sm text-[#1b0e0e] mb-2">
          📸 Photo Tips:
        </h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Ensure NID photos are clear and readable</li>
          <li>• Show your kitchen setup, cooking area, and equipment</li>
          <li>• Good lighting makes photos more appealing</li>
          <li>• Include at least one photo of your workspace</li>
        </ul>
      </div>
    </div>
  );
}
