/**
 * Order Validation Service
 * 
 * Handles validation logic for orders including:
 * - Order timing (36 hours rule)
 * - Prep time validation
 * - Kitchen capacity checking
 * - Time slot availability
 */

import { prisma } from "@/lib/prisma/prisma";
import { MealTimeSlot, MEAL_TIME_SLOTS, MIN_ORDER_ADVANCE_HOURS } from "@/lib/constants/mealTimeSlots";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface AvailableSlot {
  slot: MealTimeSlot;
  time: string;
  displayName: string;
  available: boolean;
  capacity: number;
  reason?: string;
}

/**
 * Calculate hours until delivery for a given date and time slot
 */
export function getHoursUntilDelivery(
  deliveryDate: Date,
  timeSlot: MealTimeSlot
): number {
  const slotConfig = MEAL_TIME_SLOTS[timeSlot];
  const deliveryDateTime = new Date(deliveryDate);
  
  // Parse time (HH:mm format)
  const [hours, minutes] = slotConfig.time.split(":").map(Number);
  deliveryDateTime.setHours(hours, minutes, 0, 0);
  
  const now = new Date();
  const diffMs = deliveryDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return diffHours;
}

/**
 * Validate order timing (3-day window: today, tomorrow, day after tomorrow)
 */
export function validateOrderTiming(
  deliveryDate: Date,
  timeSlot: MealTimeSlot
): ValidationResult {
  const now = new Date();
  
  // Get today, tomorrow, and day after tomorrow (start of day)
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  
  const dayAfterTomorrowEnd = new Date(dayAfterTomorrow);
  dayAfterTomorrowEnd.setHours(23, 59, 59, 999);
  
  // Normalize delivery date to start of day for comparison
  const deliveryDateStart = new Date(deliveryDate);
  deliveryDateStart.setHours(0, 0, 0, 0);
  
  // Check if delivery date is in the past (before today)
  if (deliveryDateStart < today) {
    return {
      valid: false,
      error: "Orders can only be placed for today, tomorrow, or day after tomorrow.",
    };
  }
  
  // Check if delivery date is beyond day after tomorrow
  if (deliveryDateStart > dayAfterTomorrow) {
    return {
      valid: false,
      error: "Orders can only be placed for today, tomorrow, or day after tomorrow.",
    };
  }
  
  // For today's orders, check if the time slot has already passed
  if (deliveryDateStart.getTime() === today.getTime()) {
    const hoursUntilDelivery = getHoursUntilDelivery(deliveryDate, timeSlot);
    if (hoursUntilDelivery < 0) {
      return {
        valid: false,
        error: `The ${MEAL_TIME_SLOTS[timeSlot].displayName} time slot for today has already passed.`,
      };
    }
  }
  
  return { valid: true };
}

/**
 * Check if a dish can be ordered for a specific time slot
 * based on prep time requirements
 */
export function canOrderDishForSlot(
  dishPrepTimeMinutes: number,
  kitchenMinPrepHours: number,
  hoursUntilDelivery: number
): boolean {
  const dishPrepHours = dishPrepTimeMinutes / 60;
  const totalPrepHours = dishPrepHours + kitchenMinPrepHours;
  
  return hoursUntilDelivery >= totalPrepHours;
}

/**
 * Validate prep time for all dishes in an order
 */
export async function validatePrepTime(
  menuItemIds: string[],
  deliveryDate: Date,
  timeSlot: MealTimeSlot,
  kitchenId: string
): Promise<ValidationResult> {
  const kitchen = await prisma.kitchen.findUnique({
    where: { id: kitchenId },
    select: { min_prep_time_hours: true },
  });
  
  if (!kitchen) {
    return {
      valid: false,
      error: "Kitchen not found",
    };
  }
  
  const menuItems = await prisma.menu_items.findMany({
    where: { id: { in: menuItemIds } },
    select: { id: true, name: true, prepTime: true },
  });
  
  const hoursUntilDelivery = getHoursUntilDelivery(deliveryDate, timeSlot);
  
  // If time slot has already passed, don't check prep time (timing validation will catch this)
  if (hoursUntilDelivery < 0) {
    return { valid: true }; // Let timing validation handle this
  }
  
  for (const item of menuItems) {
    const prepTimeMinutes = item.prepTime || 0;
    const canOrder = canOrderDishForSlot(
      prepTimeMinutes,
      kitchen.min_prep_time_hours,
      hoursUntilDelivery
    );
    
    if (!canOrder) {
      const totalPrepHours = (prepTimeMinutes / 60) + kitchen.min_prep_time_hours;
      return {
        valid: false,
        error: `${item.name} requires ${prepTimeMinutes} minutes (${(prepTimeMinutes / 60).toFixed(1)} hours) + ${kitchen.min_prep_time_hours} hours kitchen prep time = ${totalPrepHours.toFixed(1)} hours total. Cannot be ordered for ${MEAL_TIME_SLOTS[timeSlot].displayName} (only ${hoursUntilDelivery.toFixed(1)} hours until delivery).`,
      };
    }
  }
  
  return { valid: true };
}

/**
 * Check kitchen capacity for a specific date and time slot
 */
export async function checkKitchenCapacity(
  kitchenId: string,
  deliveryDate: Date,
  timeSlot: MealTimeSlot
): Promise<{ available: boolean; currentCount: number; maxCapacity: number; error?: string }> {
  const kitchen = await prisma.kitchen.findUnique({
    where: { id: kitchenId },
    select: { 
      max_capacity: true,
      breakfast_capacity: true,
      lunch_capacity: true,
      snacks_capacity: true,
      dinner_capacity: true,
    },
  });
  
  if (!kitchen) {
    return {
      available: false,
      currentCount: 0,
      maxCapacity: 0,
      error: "Kitchen not found",
    };
  }
  
  // Get capacity for this specific meal type, fallback to max_capacity
  let maxCapacity = kitchen.max_capacity; // default fallback
  switch (timeSlot) {
    case "BREAKFAST":
      maxCapacity = kitchen.breakfast_capacity ?? kitchen.max_capacity;
      break;
    case "LUNCH":
      maxCapacity = kitchen.lunch_capacity ?? kitchen.max_capacity;
      break;
    case "SNACKS":
      maxCapacity = kitchen.snacks_capacity ?? kitchen.max_capacity;
      break;
    case "DINNER":
      maxCapacity = kitchen.dinner_capacity ?? kitchen.max_capacity;
      break;
  }
  
  // Normalize delivery date to start of day for comparison
  const deliveryDateStart = new Date(deliveryDate);
  deliveryDateStart.setHours(0, 0, 0, 0);
  const deliveryDateEnd = new Date(deliveryDateStart);
  deliveryDateEnd.setHours(23, 59, 59, 999);
  
  // Count existing orders for this date and time slot (excluding cancelled)
  const currentCount = await prisma.order.count({
    where: {
      kitchenId,
      delivery_date: {
        gte: deliveryDateStart,
        lte: deliveryDateEnd,
      },
      delivery_time_slot: timeSlot,
      status: {
        notIn: ["CANCELLED"],
      },
    },
  });
  
  const available = currentCount < maxCapacity;
  
  return {
    available,
    currentCount,
    maxCapacity,
    error: available ? undefined : `Kitchen is full for ${MEAL_TIME_SLOTS[timeSlot].displayName}. ${currentCount}/${maxCapacity} orders already placed.`,
  };
}

/**
 * Get available time slots for a kitchen and menu items
 */
export async function getAvailableTimeSlots(
  kitchenId: string,
  menuItemIds: string[],
  deliveryDate: Date
): Promise<AvailableSlot[]> {
  const kitchen = await prisma.kitchen.findUnique({
    where: { id: kitchenId },
    select: { 
      max_capacity: true,
      breakfast_capacity: true,
      lunch_capacity: true,
      snacks_capacity: true,
      dinner_capacity: true,
      min_prep_time_hours: true,
    },
  });
  
  if (!kitchen) {
    return [];
  }
  
  const menuItems = await prisma.menu_items.findMany({
    where: { id: { in: menuItemIds } },
    select: { id: true, name: true, prepTime: true },
  });
  
  const availableSlots: AvailableSlot[] = [];
  
  // Normalize delivery date
  const deliveryDateStart = new Date(deliveryDate);
  deliveryDateStart.setHours(0, 0, 0, 0);
  const deliveryDateEnd = new Date(deliveryDateStart);
  deliveryDateEnd.setHours(23, 59, 59, 999);
  
  // Check each time slot
  for (const slot of Object.keys(MEAL_TIME_SLOTS) as MealTimeSlot[]) {
    const hoursUntilDelivery = getHoursUntilDelivery(deliveryDate, slot);
    
    // Check timing (3-day window: today, tomorrow, day after tomorrow)
    const timingCheck = validateOrderTiming(deliveryDate, slot);
    const timingValid = timingCheck.valid;
    
    // Get capacity for this specific meal type, fallback to max_capacity
    let maxCapacity = kitchen.max_capacity; // default fallback
    switch (slot) {
      case "BREAKFAST":
        maxCapacity = kitchen.breakfast_capacity ?? kitchen.max_capacity;
        break;
      case "LUNCH":
        maxCapacity = kitchen.lunch_capacity ?? kitchen.max_capacity;
        break;
      case "SNACKS":
        maxCapacity = kitchen.snacks_capacity ?? kitchen.max_capacity;
        break;
      case "DINNER":
        maxCapacity = kitchen.dinner_capacity ?? kitchen.max_capacity;
        break;
    }
    
    // Check capacity
    const currentCount = await prisma.order.count({
      where: {
        kitchenId,
        delivery_date: {
          gte: deliveryDateStart,
          lte: deliveryDateEnd,
        },
        delivery_time_slot: slot,
        status: {
          notIn: ["CANCELLED"],
        },
      },
    });
    const capacityAvailable = currentCount < maxCapacity;
    
    // Check prep time for all dishes (only if timing is valid and hoursUntilDelivery > 0)
    const canPrepareAll = timingValid && hoursUntilDelivery > 0 ? menuItems.every((item) => {
      const prepTimeMinutes = item.prepTime || 0;
      return canOrderDishForSlot(
        prepTimeMinutes,
        kitchen.min_prep_time_hours,
        hoursUntilDelivery
      );
    }) : false;
    
    const available = timingValid && capacityAvailable && canPrepareAll;
    
    let reason: string | undefined;
    if (!timingValid) {
      reason = timingCheck.error || "Time slot not available for this date";
    } else if (!capacityAvailable) {
      reason = `Kitchen full (${currentCount}/${maxCapacity} orders)`;
    } else if (!canPrepareAll) {
      reason = "Prep time insufficient for some dishes";
    }
    
    availableSlots.push({
      slot,
      time: MEAL_TIME_SLOTS[slot].time,
      displayName: MEAL_TIME_SLOTS[slot].displayName,
      available,
      capacity: Math.max(0, maxCapacity - currentCount),
      reason,
    });
  }
  
  return availableSlots;
}

/**
 * Comprehensive order validation
 */
export async function validateOrder(
  kitchenId: string,
  menuItemIds: string[],
  deliveryDate: Date,
  timeSlot: MealTimeSlot
): Promise<ValidationResult> {
  // 1. Validate timing
  const timingCheck = validateOrderTiming(deliveryDate, timeSlot);
  if (!timingCheck.valid) {
    return timingCheck;
  }
  
  // 2. Check capacity
  const capacityCheck = await checkKitchenCapacity(kitchenId, deliveryDate, timeSlot);
  if (!capacityCheck.available) {
    return {
      valid: false,
      error: capacityCheck.error || "Kitchen capacity exceeded",
    };
  }
  
  // 3. Validate prep time
  const prepTimeCheck = await validatePrepTime(menuItemIds, deliveryDate, timeSlot, kitchenId);
  if (!prepTimeCheck.valid) {
    return prepTimeCheck;
  }
  
  return { valid: true };
}
