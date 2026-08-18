import { z } from "zod";
import {
  DURATION_UNIT,
  MEMBERSHIP_STATUS,
  PAYMENT_METHOD,
} from "@/lib/constants";

const paymentInputSchema = z.object({
  amount: z.coerce.number().min(0, "Payment amount cannot be negative"),

  method: z.nativeEnum(PAYMENT_METHOD),

  paymentDate: z.string().optional(),

  transactionReference: z.string().trim().max(120).default(""),

  notes: z.string().trim().max(500).default(""),
});

export const membershipPlanSchema = z.object({
  name: z.string().trim().min(2, "Plan name is required").max(80),
  duration: z.coerce.number().int().min(1, "Duration must be at least 1"),
  durationUnit: z.nativeEnum(DURATION_UNIT),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  description: z.string().trim().max(300).default(""),
  isActive: z.boolean().default(true),
});

export const updateMembershipPlanSchema = membershipPlanSchema.partial();

export const membershipSchema = z
  .object({
    memberId: z.string().min(1, "Member is required"),

    planId: z.string().min(1, "Membership plan is required"),

    startDate: z.string().min(1, "Start date is required"),

    endDate: z.string().min(1, "End date is required"),

    // Total membership amount
    amount: z.coerce.number().min(0, "Amount cannot be negative"),

    weightAtStart: z
      .union([z.coerce.number().min(0, "Weight cannot be negative"), z.null()])
      .default(null),

    // Actual payment received
    payment: paymentInputSchema.optional(),
  })
  .refine((value) => new Date(value.endDate) >= new Date(value.startDate), {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export const membershipStatusSchema = z.object({
  status: z.nativeEnum(MEMBERSHIP_STATUS),
});

export const updateMembershipSchema = z
  .object({
    planId: z.string().min(1, "Membership plan is required").optional(),

    startDate: z.string().min(1, "Start date is required").optional(),

    endDate: z.string().min(1, "End date is required").optional(),

    // Total membership amount
    amount: z.coerce.number().min(0, "Amount cannot be negative").optional(),

    weightAtStart: z
      .union([z.coerce.number().min(0, "Weight cannot be negative"), z.null()])
      .optional(),

    status: z.nativeEnum(MEMBERSHIP_STATUS).optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.startDate &&
      value.endDate &&
      new Date(value.endDate) < new Date(value.startDate)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "End date must be on or after start date",
        path: ["endDate"],
      });
    }

    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one membership field is required",
        path: [],
      });
    }
  });

export type MembershipPlanInput = z.infer<typeof membershipPlanSchema>;

export type UpdateMembershipPlanInput = z.infer<
  typeof updateMembershipPlanSchema
>;

export type MembershipInput = z.infer<typeof membershipSchema>;

export type UpdateMembershipInput = z.infer<typeof updateMembershipSchema>;
