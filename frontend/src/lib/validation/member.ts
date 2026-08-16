import { z } from "zod";
import { GENDER, MEMBER_STATUS } from "@/lib/constants";

const optionalEmail = z.union([
  z.string().trim().toLowerCase().email("Enter a valid email"),
  z.literal(""),
]);

export const memberSchema = z.object({
  name: z.string().trim().min(2, "Member name is required").max(100),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  email: optionalEmail.default(""),
  gender: z.nativeEnum(GENDER),
  dateOfBirth: z.string().nullable().optional(),
  address: z.string().trim().max(300).default(""),
  emergencyContact: z.string().trim().max(20).default(""),
  joiningDate: z.string().min(1, "Joining date is required"),
});

export const updateMemberSchema = memberSchema.partial().extend({
  status: z.nativeEnum(MEMBER_STATUS).optional(),
});

export const memberStatusSchema = z.object({
  status: z.nativeEnum(MEMBER_STATUS),
});

export type MemberInput = z.infer<typeof memberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
