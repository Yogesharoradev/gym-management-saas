import { z } from "zod";
import { DURATION_UNIT, MEMBERSHIP_STATUS } from "@/lib/constants";

export const membershipPlanSchema = z.object({
  name: z.string().trim().min(2, "Plan name is required").max(80),
  duration: z.coerce.number().int().min(1, "Duration must be at least 1"),
  durationUnit: z.nativeEnum(DURATION_UNIT),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  description: z.string().trim().max(300).default(""),
  isActive: z.boolean().default(true),
});

export const updateMembershipPlanSchema = membershipPlanSchema.partial();

export const membershipSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  planId: z.string().min(1, "Membership plan is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  amount: z.coerce.number().min(0, "Amount cannot be negative"),
  weightAtStart: z.union([z.coerce.number().min(0, "Weight cannot be negative"), z.null()]).default(null),
}).refine((value) => new Date(value.endDate) >= new Date(value.startDate), {
  message: "End date must be on or after start date",
  path: ["endDate"],
});

export const membershipStatusSchema = z.object({
  status: z.nativeEnum(MEMBERSHIP_STATUS),
});

export type MembershipPlanInput = z.infer<typeof membershipPlanSchema>;
export type UpdateMembershipPlanInput = z.infer<typeof updateMembershipPlanSchema>;
export type MembershipInput = z.infer<typeof membershipSchema>;
