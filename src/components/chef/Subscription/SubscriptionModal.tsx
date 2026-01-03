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



export default function SubscriptionModal({
  subscription,
  menuItems,
  onClose,
  onSave,
}: SubscriptionModalProps) {
  const [formData, setFormData] = useState({
    name: subscription?.name || "",
    description: subscription?.description || "",
    frequency: subscription?.frequency || "weekly",
    servingsPerMeal: subscription?.servingsPerMeal || 2,
    price: subscription?.price || 3000,
    isActive: subscription?.isActive ?? true,
  });

  const [breakfast, setBreakfast] = useState<string[]>(subscription?.schedule.breakfast.dishIds || []);
  const [lunch, setLunch] = useState<string[]>(subscription?.schedule.lunch.dishIds || []);
  const [snacks, setSnacks] = useState<string[]>(subscription?.schedule.snacks.dishIds || []);
  const [dinner, setDinner] = useState<string[]>(subscription?.schedule.dinner.dishIds || []);

  // Time states
  const [breakfastTime, setBreakfastTime] = useState(subscription?.schedule.breakfast.time || "08:00");
  const [lunchTime, setLunchTime] = useState(subscription?.schedule.lunch.time || "12:30");
  const [snacksTime, setSnacksTime] = useState(subscription?.schedule.snacks.time || "17:00");
  const [dinnerTime, setDinnerTime] = useState(subscription?.schedule.dinner.time || "21:00");

  const [selectedDish, setSelectedDish] = useState<string | null>(null);

  // Auto-calculate meals per day based on which slots have dishes
  const mealsPerDay = (breakfast.length > 0 ? 1 : 0) + (lunch.length > 0 ? 1 : 0) + (snacks.length > 0 ? 1 : 0) + (dinner.length > 0 ? 1 : 0);
  const totalDishes = mealsPerDay * formData.servingsPerMeal;

  const addDishToSlot = (slot: "breakfast" | "lunch" | "snacks" | "dinner", dishId: string) => {
    switch (slot) {
      case "breakfast":
        if (!breakfast.includes(dishId)) setBreakfast([...breakfast, dishId]);
        break;
      case "lunch":
        if (!lunch.includes(dishId)) setLunch([...lunch, dishId]);
        break;
      case "snacks":
        if (!snacks.includes(dishId)) setSnacks([...snacks, dishId]);
        break;
      case "dinner":
        if (!dinner.includes(dishId)) setDinner([...dinner, dishId]);
        break;
    }
    setSelectedDish(null);
  };

  const removeDishFromSlot = (slot: "breakfast" | "lunch" | "snacks" | "dinner", dishId: string) => {
    switch (slot) {
      case "breakfast":
        setBreakfast(breakfast.filter((id) => id !== dishId));
        break;
      case "lunch":
        setLunch(lunch.filter((id) => id !== dishId));
        break;
      case "snacks":
        setSnacks(snacks.filter((id) => id !== dishId));
        break;
      case "dinner":
        setDinner(dinner.filter((id) => id !== dishId));
        break;
    }
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
      frequency: formData.frequency as "daily" | "weekly" | "monthly" | "custom",
      mealsPerDay, // Auto-calculated from meal slots
      subscriberCount: subscription?.subscriberCount || 0,
      monthlyRevenue: subscription?.monthlyRevenue || 0,
      schedule: {
        breakfast: { time: breakfastTime, dishIds: breakfast },
        lunch: { time: lunchTime, dishIds: lunch },
        snacks: { time: snacksTime, dishIds: snacks },
        dinner: { time: dinnerTime, dishIds: dinner },
      },
      createdAt: subscription?.createdAt || new Date(),
    };

    onSave(subscriptionData);
  };

  const getDishById = (id: string) => menuItems.find((item) => item.id === id);
  const selectedMenuItem = selectedDish ? getDishById(selectedDish) : null;

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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as "daily" | "weekly" | "monthly" | "custom" })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
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

            <div className="grid grid-cols-3 gap-4">
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

            {/* Calculation Summary */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Dishes Required</p>
                <p className="text-xs text-gray-500 mt-0.5">{mealsPerDay} meals × {formData.servingsPerMeal} servings</p>
              </div>
              <div className="text-3xl font-bold text-yellow-600">{totalDishes}</div>
            </div>
          </div>

          {/* Meal Scheduler */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900">Meal Schedule</h3>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,1fr)_2px_2fr] gap-6">
              {/* Available Dishes Column */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 h-[600px] flex flex-col">
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
                {/* Row 1: Breakfast & Lunch */}
                <MealSlotMini
                  title="Breakfast"
                  time={breakfastTime}
                  onTimeChange={setBreakfastTime}
                  dishIds={breakfast}
                  menuItems={menuItems}
                  selectedDish={selectedMenuItem}
                  onAddDish={() => selectedDish && addDishToSlot("breakfast", selectedDish)}
                  onRemoveDish={(id) => removeDishFromSlot("breakfast", id)}
                />

                <MealSlotMini
                  title="Lunch"
                  time={lunchTime}
                  onTimeChange={setLunchTime}
                  dishIds={lunch}
                  menuItems={menuItems}
                  selectedDish={selectedMenuItem}
                  onAddDish={() => selectedDish && addDishToSlot("lunch", selectedDish)}
                  onRemoveDish={(id) => removeDishFromSlot("lunch", id)}
                />

                {/* Row 2: Snacks & Dinner */}
                <MealSlotMini
                  title="Snacks"
                  time={snacksTime}
                  onTimeChange={setSnacksTime}
                  dishIds={snacks}
                  menuItems={menuItems}
                  selectedDish={selectedMenuItem}
                  onAddDish={() => selectedDish && addDishToSlot("snacks", selectedDish)}
                  onRemoveDish={(id) => removeDishFromSlot("snacks", id)}
                />

                <MealSlotMini
                  title="Dinner"
                  time={dinnerTime}
                  onTimeChange={setDinnerTime}
                  dishIds={dinner}
                  menuItems={menuItems}
                  selectedDish={selectedMenuItem}
                  onAddDish={() => selectedDish && addDishToSlot("dinner", selectedDish)}
                  onRemoveDish={(id) => removeDishFromSlot("dinner", id)}
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
