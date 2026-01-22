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
 * Validate order timing (36 hours rule)
 */
export function validateOrderTiming(
  deliveryDate: Date,
  timeSlot: MealTimeSlot
): ValidationResult {
  const hoursUntilDelivery = getHoursUntilDelivery(deliveryDate, timeSlot);
  
  if (hoursUntilDelivery < MIN_ORDER_ADVANCE_HOURS) {
    return {
      valid: false,
      error: `Orders must be placed at least ${MIN_ORDER_ADVANCE_HOURS} hours before delivery. Only ${hoursUntilDelivery.toFixed(1)} hours remaining.`,
    };
  }
  
  // Check if delivery date is in the past
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  if (deliveryDate < tomorrow) {
    return {
      valid: false,
      error: "Orders can only be placed for tomorrow or later dates.",
    };
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
    select: { minPrepTimeHours: true },
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
  
  for (const item of menuItems) {
    const prepTimeMinutes = item.prepTime || 0;
    const canOrder = canOrderDishForSlot(
      prepTimeMinutes,
      kitchen.minPrepTimeHours,
      hoursUntilDelivery
    );
    
    if (!canOrder) {
      const totalPrepHours = (prepTimeMinutes / 60) + kitchen.minPrepTimeHours;
      return {
        valid: false,
        error: `${item.name} requires ${prepTimeMinutes} minutes (${(prepTimeMinutes / 60).toFixed(1)} hours) + ${kitchen.minPrepTimeHours} hours kitchen prep time = ${totalPrepHours.toFixed(1)} hours total. Cannot be ordered for ${MEAL_TIME_SLOTS[timeSlot].displayName} (only ${hoursUntilDelivery.toFixed(1)} hours until delivery).`,
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
    select: { maxCapacity: true },
  });
  
  if (!kitchen) {
    return {
      available: false,
      currentCount: 0,
      maxCapacity: 0,
      error: "Kitchen not found",
    };
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
      deliveryDate: {
        gte: deliveryDateStart,
        lte: deliveryDateEnd,
      },
      deliveryTimeSlot: timeSlot,
      status: {
        notIn: ["CANCELLED"],
      },
    },
  });
  
  const available = currentCount < kitchen.maxCapacity;
  
  return {
    available,
    currentCount,
    maxCapacity: kitchen.maxCapacity,
    error: available ? undefined : `Kitchen is full for ${MEAL_TIME_SLOTS[timeSlot].displayName}. ${currentCount}/${kitchen.maxCapacity} orders already placed.`,
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
    select: { maxCapacity: true, minPrepTimeHours: true },
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
    
    // Check timing (36 hours rule)
    const timingValid = hoursUntilDelivery >= MIN_ORDER_ADVANCE_HOURS;
    
    // Check capacity
    const currentCount = await prisma.order.count({
      where: {
        kitchenId,
        deliveryDate: {
          gte: deliveryDateStart,
          lte: deliveryDateEnd,
        },
        deliveryTimeSlot: slot,
        status: {
          notIn: ["CANCELLED"],
        },
      },
    });
    const capacityAvailable = currentCount < kitchen.maxCapacity;
    
    // Check prep time for all dishes
    const canPrepareAll = menuItems.every((item) => {
      const prepTimeMinutes = item.prepTime || 0;
      return canOrderDishForSlot(
        prepTimeMinutes,
        kitchen.minPrepTimeHours,
        hoursUntilDelivery
      );
    });
    
    const available = timingValid && capacityAvailable && canPrepareAll;
    
    let reason: string | undefined;
    if (!timingValid) {
      reason = `Order deadline passed (need ${MIN_ORDER_ADVANCE_HOURS} hours, only ${hoursUntilDelivery.toFixed(1)} hours remaining)`;
    } else if (!capacityAvailable) {
      reason = `Kitchen full (${currentCount}/${kitchen.maxCapacity} orders)`;
    } else if (!canPrepareAll) {
      reason = "Prep time insufficient for some dishes";
    }
    
    availableSlots.push({
      slot,
      time: MEAL_TIME_SLOTS[slot].time,
      displayName: MEAL_TIME_SLOTS[slot].displayName,
      available,
      capacity: kitchen.maxCapacity - currentCount,
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
