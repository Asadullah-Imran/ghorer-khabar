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


export const chefOnboardingSchema = z.object({
  kitchenName: z.string().min(3, "Kitchen name must be at least 3 characters"),
  address: z.string().min(10, "Please provide a detailed address"),
  zone: z.string().min(2, "Zone is required"),
  latitude: z.number(),
  longitude: z.number(),
  nidName: z.string().min(2, "Name on NID is required"),
  phone: z
    .string()
    .regex(
      /^(\+880|880)?1[3-9]\d{8}$/,
      "Valid Bangladesh phone number required"
    ),
  nidFrontImage: z.string().url("NID front image is required"),
  nidBackImage: z.string().url("NID back image is required"),
  kitchenImages: z
    .array(z.string().url())
    .min(1, "At least 1 kitchen image required")
    .max(4, "Maximum 4 kitchen images allowed"),
});

export type ChefOnboardingData = z.infer<typeof chefOnboardingSchema>;

// ============================================================================
// USER PROFILE VALIDATION SCHEMAS
// ============================================================================

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z
    .string()
    .regex(
      /^(\+880|880)?1[3-9]\d{8}$/,
      "Valid Bangladesh phone number required"
    )
    .optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordData = z.infer<typeof updatePasswordSchema>;

