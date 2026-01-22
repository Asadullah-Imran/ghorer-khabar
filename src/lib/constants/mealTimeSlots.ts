/**
 * Meal Time Slots Configuration
 * 
 * Defines the standard meal time slots and their delivery times.
 * These can be customized per kitchen in the future.
 */

export type MealTimeSlot = "BREAKFAST" | "LUNCH" | "SNACKS" | "DINNER";

export interface MealSlotConfig {
  time: string; // HH:mm format
  name: string;
  displayName: string;
}

export const MEAL_TIME_SLOTS: Record<MealTimeSlot, MealSlotConfig> = {
  BREAKFAST: {
    time: "08:00",
    name: "BREAKFAST",
    displayName: "Breakfast",
  },
  LUNCH: {
    time: "13:00",
    name: "LUNCH",
    displayName: "Lunch",
  },
  SNACKS: {
    time: "16:00",
    name: "SNACKS",
    displayName: "Snacks",
  },
  DINNER: {
    time: "20:00",
    name: "DINNER",
    displayName: "Dinner",
  },
};

/**
 * Get all meal time slots in order
 */
export function getAllMealSlots(): MealTimeSlot[] {
  return ["BREAKFAST", "LUNCH", "SNACKS", "DINNER"];
}

/**
 * Get meal slot config by type
 */
export function getMealSlotConfig(slot: MealTimeSlot): MealSlotConfig {
  return MEAL_TIME_SLOTS[slot];
}

/**
 * Get meal slot display name
 */
export function getMealSlotDisplayName(slot: MealTimeSlot): string {
  return MEAL_TIME_SLOTS[slot].displayName;
}

/**
 * Get meal slot time
 */
export function getMealSlotTime(slot: MealTimeSlot): string {
  return MEAL_TIME_SLOTS[slot].time;
}

/**
 * Minimum hours before delivery for ordering (36 hours)
 */
export const MIN_ORDER_ADVANCE_HOURS = 36;
