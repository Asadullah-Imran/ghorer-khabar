import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// ============================================================================
// SUBSCRIPTION VALIDATION SCHEMAS
// ============================================================================

export const dayOfWeekSchema = z.enum([
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
]);

export const mealTypeSchema = z.enum(["BREAKFAST", "LUNCH", "SNACKS", "DINNER"]);

export const mealSlotSchema = z.object({
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format"),
  dishIds: z
    .array(z.string().min(1))
    .default([]),
});

export const dayScheduleSchema = z.object({
  breakfast: mealSlotSchema.optional(),
  lunch: mealSlotSchema.optional(),
  snacks: mealSlotSchema.optional(),
  dinner: mealSlotSchema.optional(),
});

export const weeklyScheduleSchema = z.object({
  SATURDAY: dayScheduleSchema.optional(),
  SUNDAY: dayScheduleSchema.optional(),
  MONDAY: dayScheduleSchema.optional(),
  TUESDAY: dayScheduleSchema.optional(),
  WEDNESDAY: dayScheduleSchema.optional(),
  THURSDAY: dayScheduleSchema.optional(),
  FRIDAY: dayScheduleSchema.optional(),
});

export const createSubscriptionSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  price: z.number().positive(),
  servingsPerMeal: z.number().int().positive(),
  isActive: z.boolean().default(true),
  schedule: weeklyScheduleSchema,
  coverImage: z.string().url().optional(),
  calories: z.number().int().optional(),
  protein: z.string().optional(),
  carbs: z.string().optional(),
  fats: z.string().optional(),
  chefQuote: z.string().optional(),
});

export const updateSubscriptionSchema = createSubscriptionSchema.partial();

export const toggleSubscriptionStatusSchema = z.object({
  isActive: z.boolean(),
});
