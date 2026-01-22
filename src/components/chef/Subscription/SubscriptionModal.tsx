"use client";

import { useToast } from "@/contexts/ToastContext";
import { ChefHat, Clock, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface MealSlot {
  time: string;
  dishIds: string[];
}

interface DaySchedule {
  breakfast?: MealSlot;
  lunch?: MealSlot;
  snacks?: MealSlot;
  dinner?: MealSlot;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  mealsPerDay: number;
  servingsPerMeal: number;
  price: number;
  isActive: boolean;
  subscriberCount: number;
  monthlyRevenue: number;
  coverImage?: string;
  schedule?: Record<string, DaySchedule>;
  createdAt: Date;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  prepTime?: number;
  calories?: number;
  isVegetarian: boolean;
  isAvailable: boolean;
}

interface SubscriptionModalProps {
  subscription?: SubscriptionPlan;
  menuItems: MenuItem[];
  onClose: () => void;
  onSave: (subscription: Partial<SubscriptionPlan>) => void;
}

const DAYS_OF_WEEK = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
type DayOfWeek = typeof DAYS_OF_WEEK[number];

export default function SubscriptionModal({
  subscription,
  menuItems,
  onClose,
  onSave,
}: SubscriptionModalProps) {
  const [formData, setFormData] = useState({
    name: subscription?.name || "",
    description: subscription?.description || "",
    servingsPerMeal: subscription?.servingsPerMeal || 2,
    price: subscription?.price || 3000,
    isActive: subscription?.isActive ?? true,
    coverImage: subscription?.coverImage || "",
  });

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("Saturday");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Transform incoming schedule from API (UPPERCASE keys) to component format (Title Case)
  const transformScheduleFromAPI = (apiSchedule?: Record<string, DaySchedule>) => {
    if (!apiSchedule) {
      return {
        Saturday: { breakfast: { time: "08:00", dishIds: [] }, lunch: { time: "13:00", dishIds: [] }, snacks: { time: "17:00", dishIds: [] }, dinner: { time: "21:00", dishIds: [] } },
        Sunday: { breakfast: { time: "08:00", dishIds: [] }, lunch: { time: "13:00", dishIds: [] }, snacks: { time: "17:00", dishIds: [] }, dinner: { time: "21:00", dishIds: [] } },
        Monday: { breakfast: { time: "08:00", dishIds: [] }, lunch: { time: "13:00", dishIds: [] }, snacks: { time: "17:00", dishIds: [] }, dinner: { time: "21:00", dishIds: [] } },
        Tuesday: { breakfast: { time: "08:00", dishIds: [] }, lunch: { time: "13:00", dishIds: [] }, snacks: { time: "17:00", dishIds: [] }, dinner: { time: "21:00", dishIds: [] } },
        Wednesday: { breakfast: { time: "08:00", dishIds: [] }, lunch: { time: "13:00", dishIds: [] }, snacks: { time: "17:00", dishIds: [] }, dinner: { time: "21:00", dishIds: [] } },
        Thursday: { breakfast: { time: "08:00", dishIds: [] }, lunch: { time: "13:00", dishIds: [] }, snacks: { time: "17:00", dishIds: [] }, dinner: { time: "21:00", dishIds: [] } },
        Friday: { breakfast: { time: "08:00", dishIds: [] }, lunch: { time: "13:00", dishIds: [] }, snacks: { time: "17:00", dishIds: [] }, dinner: { time: "21:00", dishIds: [] } },
      };
    }

    const dayMap: Record<string, string> = {
      SATURDAY: "Saturday",
      SUNDAY: "Sunday",
      MONDAY: "Monday",
      TUESDAY: "Tuesday",
      WEDNESDAY: "Wednesday",
      THURSDAY: "Thursday",
      FRIDAY: "Friday",
    };

    const transformed: Record<string, DaySchedule> = {};
    for (const [apiDay, daySchedule] of Object.entries(apiSchedule)) {
      const componentDay = dayMap[apiDay] || apiDay;
      transformed[componentDay] = daySchedule;
    }
    return transformed;
  };

  const [schedule, setSchedule] = useState<SubscriptionPlan["schedule"] | undefined>(
    transformScheduleFromAPI(subscription?.schedule)
  );

  const [selectedDish, setSelectedDish] = useState<string | null>(null);
  const toast = useToast();

  const currentDaySchedule = (schedule && schedule[selectedDay]) || {
    breakfast: { time: "08:00", dishIds: [] },
    lunch: { time: "13:00", dishIds: [] },
    snacks: { time: "17:00", dishIds: [] },
    dinner: { time: "21:00", dishIds: [] },
  };

  // Auto-calculate meals per day based on which slots have dishes
  const mealsPerDay = Math.max(
    ...DAYS_OF_WEEK.map((day) => {
      const daySchedule = schedule?.[day];
      if (!daySchedule) return 0;
      return (daySchedule.breakfast?.dishIds.length ? 1 : 0) +
             (daySchedule.lunch?.dishIds.length ? 1 : 0) +
             (daySchedule.snacks?.dishIds.length ? 1 : 0) +
             (daySchedule.dinner?.dishIds.length ? 1 : 0);
    })
  );

  const addDishToSlot = (day: DayOfWeek, slot: "breakfast" | "lunch" | "snacks" | "dinner", dishId: string) => {
    setSchedule((prev) => {
      const existingDay = prev?.[day] || {
        breakfast: { time: "08:00", dishIds: [] },
        lunch: { time: "13:00", dishIds: [] },
        snacks: { time: "17:00", dishIds: [] },
        dinner: { time: "21:00", dishIds: [] },
      };
      const existingSlot = existingDay[slot] || { time: "12:00", dishIds: [] };
      
      return {
        ...prev,
        [day]: {
          ...existingDay,
          [slot]: {
            ...existingSlot,
            dishIds: [...(existingSlot.dishIds || []), dishId],
          },
        },
      };
    });
    setSelectedDish(null);
  };

  const removeDishFromSlot = (day: DayOfWeek, slot: "breakfast" | "lunch" | "snacks" | "dinner", dishId: string) => {
    setSchedule((prev) => {
      const existingDay = prev?.[day] || {
        breakfast: { time: "08:00", dishIds: [] },
        lunch: { time: "13:00", dishIds: [] },
        snacks: { time: "17:00", dishIds: [] },
        dinner: { time: "21:00", dishIds: [] },
      };
      const existingSlot = existingDay[slot] || { time: "12:00", dishIds: [] };
      
      return {
        ...prev,
        [day]: {
          ...existingDay,
          [slot]: {
            ...existingSlot,
            dishIds: (existingSlot.dishIds || []).filter((id) => id !== dishId),
          },
        },
      };
    });
  };

  const updateMealTime = (day: DayOfWeek, slot: "breakfast" | "lunch" | "snacks" | "dinner", time: string) => {
    setSchedule((prev) => {
      const existingDay = prev?.[day] || {
        breakfast: { time: "08:00", dishIds: [] },
        lunch: { time: "13:00", dishIds: [] },
        snacks: { time: "17:00", dishIds: [] },
        dinner: { time: "21:00", dishIds: [] },
      };
      const existingSlot = existingDay[slot] || { time: "12:00", dishIds: [] };
      
      return {
        ...prev,
        [day]: {
          ...existingDay,
          [slot]: {
            ...existingSlot,
            time,
          },
        },
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "subscription-plan-images");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, coverImage: data.url }));
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.warning("Validation Error", "Plan name is required");
      return;
    }

    const subscriptionData: Partial<SubscriptionPlan> = {
      id: subscription?.id || `sub-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      servingsPerMeal: formData.servingsPerMeal,
      isActive: formData.isActive,
      coverImage: formData.coverImage,
      mealsPerDay,
      subscriberCount: subscription?.subscriberCount || 0,
      monthlyRevenue: subscription?.monthlyRevenue || 0,
      schedule,
      createdAt: subscription?.createdAt || new Date(),
    };

    onSave(subscriptionData);
  };

  const getDishById = (id: string) => menuItems.find((item) => item.id === id);
  const selectedMenuItem = selectedDish ? getDishById(selectedDish) : null;

  const totalDishes = (schedule ? Object.values(schedule) : []).reduce((sum, daySchedule) => {
    return sum +
      (daySchedule.breakfast?.dishIds.length || 0) +
      (daySchedule.lunch?.dishIds.length || 0) +
      (daySchedule.snacks?.dishIds.length || 0) +
      (daySchedule.dinner?.dishIds.length || 0);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {subscription ? "Edit Subscription Plan" : "Create New Subscription Plan"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                  placeholder="e.g., Daily Deluxe Pack"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (৳)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 resize-none"
                rows={2}
                placeholder="Brief description of the plan"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Plan Image</label>
              <div className="space-y-3">
                {formData.coverImage ? (
                  <div className="relative group">
                    <img
                      src={formData.coverImage}
                      alt="Plan preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, coverImage: "" })}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImagePlus size={32} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload plan image</p>
                      <p className="text-xs text-gray-500">PNG, JPG, WebP (Max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                )}
                {isUploading && (
                  <div className="text-center py-2">
                    <p className="text-sm text-yellow-600">Uploading image...</p>
                  </div>
                )}
                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {uploadError}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Meals/Day</label>
                <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between">
                  <span className="text-gray-900 font-semibold">{mealsPerDay}</span>
                  <span className="text-xs text-gray-500">Auto-calculated</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Servings/Meal</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.servingsPerMeal}
                  onChange={(e) => setFormData({ ...formData, servingsPerMeal: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            {/* Calculation Summary */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Dishes Required</p>
                <p className="text-xs text-gray-500 mt-0.5">{mealsPerDay} meals × {formData.servingsPerMeal} servings × 7 days</p>
              </div>
              <div className="text-3xl font-bold text-yellow-600">{totalDishes}</div>
            </div>
          </div>

          {/* Weekly Meal Scheduler */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900">Weekly Meal Schedule</h3>

            {/* Day Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition whitespace-nowrap ${
                    selectedDay === day
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Meal Scheduler for Selected Day */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,1fr)_2px_2fr] gap-6 mt-4">
              {/* Available Dishes Column */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 h-[400px] flex flex-col">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <ChefHat size={16} className="text-yellow-500" />
                  Available Dishes
                </h4>
                <div className="space-y-2 overflow-y-auto flex-1">
                  {menuItems.map((dish) => (
                    <button
                      key={dish.id}
                      type="button"
                      onClick={() => setSelectedDish(selectedDish === dish.id ? null : dish.id)}
                      className={`w-full px-3 py-2 rounded-lg border text-left text-xs transition ${
                        selectedDish === dish.id
                          ? "border-yellow-400 bg-yellow-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{dish.name}</p>
                      <p className="text-gray-600">{dish.category}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vertical Separator */}
              <div className="bg-gray-300 hidden lg:block"></div>

              {/* Meal Slots Grid (2x2) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Breakfast & Lunch */}
                <MealSlotMini
                  title="Breakfast"
                  time={currentDaySchedule.breakfast?.time || "08:00"}
                  onTimeChange={(time) => updateMealTime(selectedDay, "breakfast", time)}
                  dishIds={currentDaySchedule.breakfast?.dishIds || []}
                  menuItems={menuItems}
                  selectedDish={selectedMenuItem}
                  onAddDish={() => selectedDish && addDishToSlot(selectedDay, "breakfast", selectedDish)}
                  onRemoveDish={(id) => removeDishFromSlot(selectedDay, "breakfast", id)}
                />

                <MealSlotMini
                  title="Lunch"
                  time={currentDaySchedule.lunch?.time || "13:00"}
                  onTimeChange={(time) => updateMealTime(selectedDay, "lunch", time)}
                  dishIds={currentDaySchedule.lunch?.dishIds || []}
                  menuItems={menuItems}
                  selectedDish={selectedMenuItem}
                  onAddDish={() => selectedDish && addDishToSlot(selectedDay, "lunch", selectedDish)}
                  onRemoveDish={(id) => removeDishFromSlot(selectedDay, "lunch", id)}
                />

                {/* Snacks & Dinner */}
                <MealSlotMini
                  title="Snacks"
                  time={currentDaySchedule.snacks?.time || "17:00"}
                  onTimeChange={(time) => updateMealTime(selectedDay, "snacks", time)}
                  dishIds={currentDaySchedule.snacks?.dishIds || []}
                  menuItems={menuItems}
                  selectedDish={selectedMenuItem}
                  onAddDish={() => selectedDish && addDishToSlot(selectedDay, "snacks", selectedDish)}
                  onRemoveDish={(id) => removeDishFromSlot(selectedDay, "snacks", id)}
                />

                <MealSlotMini
                  title="Dinner"
                  time={currentDaySchedule.dinner?.time || "21:00"}
                  onTimeChange={(time) => updateMealTime(selectedDay, "dinner", time)}
                  dishIds={currentDaySchedule.dinner?.dishIds || []}
                  menuItems={menuItems}
                  selectedDish={selectedMenuItem}
                  onAddDish={() => selectedDish && addDishToSlot(selectedDay, "dinner", selectedDish)}
                  onRemoveDish={(id) => removeDishFromSlot(selectedDay, "dinner", id)}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition"
          >
            {subscription ? "Update Plan" : "Create Plan"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

interface MealSlotMiniProps {
  title: string;
  time: string;
  onTimeChange: (time: string) => void;
  dishIds: string[];
  menuItems: MenuItem[];
  selectedDish: MenuItem | null | undefined;
  onAddDish: () => void;
  onRemoveDish: (dishId: string) => void;
}

function MealSlotMini({
  title,
  time,
  onTimeChange,
  dishIds,
  menuItems,
  selectedDish,
  onAddDish,
  onRemoveDish,
}: MealSlotMiniProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-gray-900">{title}</h4>
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded border border-gray-200">
          <Clock size={14} className="text-gray-600" />
          <input
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            className="bg-transparent text-sm font-semibold text-gray-900 focus:outline-none w-20"
          />
        </div>
      </div>

      <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
        {dishIds.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-2">No dishes</p>
        ) : (
          dishIds.map((dishId) => {
            const dish = menuItems.find((m) => m.id === dishId);
            return dish ? (
              <div
                key={dishId}
                className="flex items-center justify-between bg-teal-50 p-2 rounded border border-teal-200"
              >
                <p className="text-xs font-semibold text-gray-900 truncate">{dish.name}</p>
                <button
                  type="button"
                  onClick={() => onRemoveDish(dishId)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ) : null;
          })
        )}
      </div>

      <button
        type="button"
        onClick={onAddDish}
        disabled={!selectedDish}
        className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
          selectedDish
            ? "bg-yellow-400 text-gray-900 hover:bg-yellow-500"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        <Plus size={14} />
        Add
      </button>
    </div>
  );
}
