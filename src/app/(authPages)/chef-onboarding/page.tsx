"use client";

import ChefGuard from "@/components/auth/ChefGuard";
import ImageUploadStep from "@/components/chef/onboarding/ImageUploadStep";
import KitchenAddressStep from "@/components/chef/onboarding/KitchenAddressStep";
import KitchenNameStep from "@/components/chef/onboarding/KitchenNameStep";
import NIDDetailsStep from "@/components/chef/onboarding/NIDDetailsStep";
import StepIndicator from "@/components/chef/onboarding/StepIndicator";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmation } from "@/contexts/ConfirmationContext";
import { useAuth } from "@/contexts/AuthContext";
import { chefOnboardingSchema } from "@/lib/validation";
import { ArrowLeft, ArrowRight, CheckCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";

const STEPS = ["Kitchen Name", "Location", "Personal Info", "Photos"];
const STORAGE_KEY = "chef_onboarding_progress";

export default function ChefOnboardingPage() {
  const router = useRouter();
  const { confirm, setLoading: setConfirmLoading } = useConfirmation();
  const { refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    kitchenName: "",
    address: "",
    zone: "",
    latitude: null as number | null,
    longitude: null as number | null,
    nidName: "",
    phone: "",
    nidFrontImage: null as string | null,
    nidBackImage: null as string | null,
    kitchenImages: [] as string[],
  });
  const [phoneFromProfile, setPhoneFromProfile] = useState(false);

  // Fetch user profile to auto-fill phone number
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          if (data.user?.phone) {
            // Extract phone number - remove 880 prefix if present, keep only digits
            let phoneNumber = data.user.phone.replace(/\D/g, "");
            // Remove 880 prefix if present
            if (phoneNumber.startsWith("880")) {
              phoneNumber = phoneNumber.slice(3);
            }
            // If starts with 01, remove the "01" prefix (we'll show it in UI)
            if (phoneNumber.startsWith("01")) {
              phoneNumber = phoneNumber.slice(2);
            } else if (phoneNumber.startsWith("1")) {
              // If starts with 1, remove it (old format)
              phoneNumber = phoneNumber.slice(1);
            }
            // Update form data with phone number (9 digits after "01")
            setFormData((prev) => ({
              ...prev,
              phone: phoneNumber.slice(0, 9), // Ensure max 9 digits
            }));
            // Mark that phone is from profile
            setPhoneFromProfile(true);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Only load saved data if phone is not already set from profile
        const savedFormData = data.formData || {};
        setFormData((prev) => ({
          ...savedFormData,
          // Keep phone from profile if it exists, otherwise use saved
          phone: prev.phone || savedFormData.phone || "",
        }));
        setCurrentStep(data.currentStep || 1);
      } catch (error) {
        console.error("Failed to load saved progress:", error);
      }
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ formData, currentStep })
    );
  }, [formData, currentStep]);

  const validateStep = (step: number): boolean => {
    setErrors({});

    switch (step) {
      case 1:
        if (!formData.kitchenName || formData.kitchenName.length < 3) {
          setErrors({
            kitchenName: "Kitchen name must be at least 3 characters",
          });
          return false;
        }
        return true;

      case 2:
        const locationErrors: Record<string, string> = {};
        if (!formData.address || formData.address.length < 10) {
          locationErrors.address = "Please provide a detailed address";
        }
        if (!formData.zone || formData.zone.length < 2) {
          locationErrors.zone = "Zone is required";
        }
        if (!formData.latitude || !formData.longitude) {
          locationErrors.location = "Please select location on map";
        }
        if (Object.keys(locationErrors).length > 0) {
          setErrors(locationErrors);
          return false;
        }
        return true;

      case 3:
        const detailsErrors: Record<string, string> = {};
        if (!formData.nidName || formData.nidName.length < 2) {
          detailsErrors.nidName = "Name on NID is required";
        }
        // Phone should be 9 digits (after "01" prefix)
        if (!formData.phone.match(/^\d{9}$/)) {
          detailsErrors.phone =
            "Please enter 11 digits (01 is already included)";
        }
        if (Object.keys(detailsErrors).length > 0) {
          setErrors(detailsErrors);
          return false;
        }
        return true;

      case 4:
        const imageErrors: Record<string, string> = {};
        if (!formData.nidFrontImage) {
          imageErrors.nidFront = "NID front image is required";
        }
        if (!formData.nidBackImage) {
          imageErrors.nidBack = "NID back image is required";
        }
        if (formData.kitchenImages.length === 0) {
          imageErrors.kitchen = "At least 1 kitchen image is required";
        }
        if (Object.keys(imageErrors).length > 0) {
          setErrors(imageErrors);
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleCancel = async () => {
    // Show confirmation modal
    const confirmed = await confirm({
      title: "Cancel Chef Onboarding",
      message: "Are you sure you want to cancel the chef onboarding process? All your progress will be lost and your account will be reverted to buyer.",
      confirmLabel: "Yes, Cancel",
      cancelLabel: "Continue Onboarding",
      variant: "warning",
    });

    if (!confirmed) {
      return;
    }

    setConfirmLoading(true);

    try {
      // Call API to revert role back to BUYER
      const response = await fetch("/api/user/revert-to-buyer", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel onboarding");
      }

      // Clear saved progress
      localStorage.removeItem(STORAGE_KEY);

      // Refresh user data
      await refreshUser();

      // Show success message
      toast.success("Onboarding Cancelled", "Your account has been reverted to buyer. Redirecting to profile...");

      // Redirect to profile page
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (error: any) {
      console.error("Error cancelling onboarding:", error);
      toast.error(
        "Cancel Failed",
        error.message || "Failed to cancel onboarding. Please try again."
      );
      setConfirmLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setSubmitting(true);
    try {
      // Final validation - prepend "01" to form phone (9 digits) to make 11 digits
      const validatedData = chefOnboardingSchema.parse({
        kitchenName: formData.kitchenName,
        address: formData.address,
        zone: formData.zone,
        latitude: formData.latitude,
        longitude: formData.longitude,
        nidName: formData.nidName,
        phone: `01${formData.phone}`, // Prepend "01" to make 11 digits
        nidFrontImage: formData.nidFrontImage,
        nidBackImage: formData.nidBackImage,
        kitchenImages: formData.kitchenImages,
      });

      const response = await fetch("/api/chef/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit onboarding");
      }

      // Clear saved progress
      localStorage.removeItem(STORAGE_KEY);

      // Redirect to waiting approval page
      window.location.href = "/chef/waiting-approval";
    } catch (error) {
      console.error("Submission error:", error);
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error(
          "Onboarding Failed",
          error instanceof Error ? error.message : "Failed to submit onboarding"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ChefGuard>
      <div className="min-h-screen bg-[#f8f6f6] py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header with Cancel Button */}
          <div className="text-center mb-8 relative">
            <button
              onClick={handleCancel}
              className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cancel onboarding"
            >
              <X size={24} />
            </button>
            <h1 className="text-3xl font-black text-[#1b0e0e] mb-2">
              Welcome to <span className="text-[#477e77]">Ghorer Khabar</span>
            </h1>
            <p className="text-gray-600">
              Let's set up your kitchen in a few simple steps
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator
            currentStep={currentStep}
            totalSteps={STEPS.length}
            steps={STEPS}
          />

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
            {currentStep === 1 && (
              <KitchenNameStep
                kitchenName={formData.kitchenName}
                onChange={(value) =>
                  setFormData({ ...formData, kitchenName: value })
                }
                error={errors.kitchenName}
              />
            )}

            {currentStep === 2 && (
              <KitchenAddressStep
                address={formData.address}
                zone={formData.zone}
                latitude={formData.latitude}
                longitude={formData.longitude}
                onAddressChange={(value) => {
                  setFormData((prev) => ({ ...prev, address: value }));
                }}
                onZoneChange={(value) => {
                  setFormData((prev) => ({ ...prev, zone: value }));
                }}
                onLocationChange={(lat, lng, addr) => {
                  setFormData((prev) => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                  }));
                }}
                errors={errors}
              />
            )}

            {currentStep === 3 && (
              <NIDDetailsStep
                nidName={formData.nidName}
                phone={formData.phone}
                onNidNameChange={(value) =>
                  setFormData({ ...formData, nidName: value })
                }
                onPhoneChange={(value) =>
                  setFormData({ ...formData, phone: value })
                }
                errors={errors}
                phoneFromProfile={phoneFromProfile}
              />
            )}

            {currentStep === 4 && (
              <ImageUploadStep
                nidFrontImage={formData.nidFrontImage}
                nidBackImage={formData.nidBackImage}
                kitchenImages={formData.kitchenImages}
                onNidFrontUpload={(url) =>
                  setFormData({ ...formData, nidFrontImage: url || null })
                }
                onNidBackUpload={(url) =>
                  setFormData({ ...formData, nidBackImage: url || null })
                }
                onKitchenImageUpload={(url) =>
                  setFormData({
                    ...formData,
                    kitchenImages: [...formData.kitchenImages, url],
                  })
                }
                onKitchenImageRemove={(index) =>
                  setFormData({
                    ...formData,
                    kitchenImages: formData.kitchenImages.filter(
                      (_, i) => i !== index
                    ),
                  })
                }
                errors={errors}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                disabled={submitting}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ArrowLeft size={20} />
                Back
              </button>
            )}

            {currentStep < STEPS.length ? (
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-[#477e77] text-white rounded-lg font-semibold hover:bg-[#3d6b65] transition-colors flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-[#feb728] text-[#1b0e0e] rounded-lg font-semibold hover:bg-[#e5a520] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-[#feb728]/20"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <CheckCircle size={20} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </ChefGuard>
  );
}
