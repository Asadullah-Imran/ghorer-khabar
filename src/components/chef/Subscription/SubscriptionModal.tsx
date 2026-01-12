"use client";

import { SubscriptionPlan, MenuItem } from "@/lib/dummy-data/chef";
import { X, Clock, Plus, Trash2, ChefHat } from "lucide-react";
import { useState } from "react";

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
  });

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("Saturday");
  const [schedule, setSchedule] = useState<SubscriptionPlan["schedule"]>(
    subscription?.schedule || {
      Saturday: { breakfast: { time: "08:00", dishIds: [] }, lunch: { time: "13:00", dishIds: [] }, snacks: { time: "17:00", dishIds: [] }, dinner: { time: "21:00", dishIds: [] } },
      Sunday: { breakfast: { time: "08:00", dishIds: [] }, lunch: { time: "13:00", dishIds: [] }, snacks: { time: "17:00", dishIds: [] }, dinner: { time: "21:00", dishIds: [] } },
      Monday: { breakfast: { time: "08:00", dishIds: [] }, lunch: { time: "13:00", dishIds: [] }, snacks: { time: "17:00", dishIds: [] }, dinner: { time: "21:00", dishIds: [] } },
      Tuesday: { breakfast: { time: "08:00", dishIds: [] }, lunch: { time: "13:00", dishIds: [] }, snacks: { time: "17:00", dishIds: [] }, dinner: { time: "21:00", dishIds: [] } },
      Wednesday: { breakfast: { time: "08:00", dishIds: [] }, lunch: { time: "13:00", dishIds: [] }, snacks: { time: "17:00", dishIds: [] }, dinner: { time: "21:00", dishIds: [] } },
      Thursday: { breakfast: { time: "08:00", dishIds: [] }, lunch: { time: "13:00", dishIds: [] }, snacks: { time: "17:00", dishIds: [] }, dinner: { time: "21:00", dishIds: [] } },
      Friday: { breakfast: { time: "08:00", dishIds: [] }, lunch: { time: "13:00", dishIds: [] }, snacks: { time: "17:00", dishIds: [] }, dinner: { time: "21:00", dishIds: [] } },
    }
  );

  const [selectedDish, setSelectedDish] = useState<string | null>(null);

  const currentDaySchedule = schedule[selectedDay];

  // Auto-calculate meals per day based on which slots have dishes
  const mealsPerDay = Math.max(
    ...DAYS_OF_WEEK.map((day) => {
      const daySchedule = schedule[day];
      return (daySchedule.breakfast?.dishIds.length ? 1 : 0) +
             (daySchedule.lunch?.dishIds.length ? 1 : 0) +
             (daySchedule.snacks?.dishIds.length ? 1 : 0) +
             (daySchedule.dinner?.dishIds.length ? 1 : 0);
    })
  );

  const addDishToSlot = (day: DayOfWeek, slot: "breakfast" | "lunch" | "snacks" | "dinner", dishId: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: {
          ...prev[day][slot],
          dishIds: [...(prev[day][slot]?.dishIds || []), dishId],
        },
      },
    }));
    setSelectedDish(null);
  };

  const removeDishFromSlot = (day: DayOfWeek, slot: "breakfast" | "lunch" | "snacks" | "dinner", dishId: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: {
          ...prev[day][slot],
          dishIds: (prev[day][slot]?.dishIds || []).filter((id) => id !== dishId),
        },
      },
    }));
  };

  const updateMealTime = (day: DayOfWeek, slot: "breakfast" | "lunch" | "snacks" | "dinner", time: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: {
          ...prev[day][slot],
          time,
        },
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Plan name is required");
      return;
    }

    const subscriptionData: Partial<SubscriptionPlan> = {
      id: subscription?.id || `sub-${Date.now()}`,
      ...formData,
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

  const totalDishes = Object.values(schedule).reduce((sum, daySchedule) => {
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
