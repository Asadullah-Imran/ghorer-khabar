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
