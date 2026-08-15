import { z } from "zod";
import { GYM_STATUS, SUBSCRIPTION_STATUS } from "@/lib/constants";
import { strongPasswordSchema } from "@/lib/validation/auth";

const optionalEmail = z
  .union([
    z.string().trim().toLowerCase().email("Enter a valid email"),
    z.literal(""),
  ])
  .optional();

export const createGymSchema = z.object({
  name: z.string().trim().min(2, "Gym name is required"),
  email: optionalEmail,
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  logo: z.string().url("Logo must be a valid URL").nullable().optional(),
  subscriptionStatus: z.nativeEnum(SUBSCRIPTION_STATUS).optional(),
  admin: z.object({
    name: z.string().trim().min(2, "Admin name is required"),
    email: z.string().trim().toLowerCase().email("Enter a valid admin email"),
    password: strongPasswordSchema,
  }),
});

export type CreateGymInput = z.infer<typeof createGymSchema>;

export const updateGymSchema = z
  .object({
    name: z.string().trim().min(2, "Gym name is required").optional(),
    email: optionalEmail,
    phone: z.string().trim().optional(),
    address: z.string().trim().optional(),
    logo: z.string().url("Logo must be a valid URL").nullable().optional(),
    subscriptionStatus: z.nativeEnum(SUBSCRIPTION_STATUS).optional(),
    subscriptionEndDate: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields provided to update",
  });

export type UpdateGymInput = z.infer<typeof updateGymSchema>;

export const gymStatusSchema = z.object({
  status: z.nativeEnum(GYM_STATUS),
});

export type GymStatusInput = z.infer<typeof gymStatusSchema>;
