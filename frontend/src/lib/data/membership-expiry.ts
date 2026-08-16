import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { tenant } from "@/lib/data/tenant";
import { MemberModel } from "@/models/member.model";
import { MembershipModel, type IMembership } from "@/models/membership.model";
import { MembershipPlanModel, type IMembershipPlan } from "@/models/membership-plan.model";
import { MEMBERSHIP_STATUS, type MembershipStatus } from "@/lib/constants";

export type ExpiryBucket = "TODAY" | "THREE_DAYS" | "SEVEN_DAYS" | "THIRTY_DAYS" | "EXPIRED";

export interface ExpiryMembership {
  id: string;
  member: { id: string; name: string; phone: string; status: string };
  plan: { id: string; name: string; duration: number; durationUnit: string; price: number; isActive: boolean };
  startDate: string;
  endDate: string;
  amount: number;
  weightAtStart: number | null;
  status: MembershipStatus;
  daysLeft: number;
  bucket: ExpiryBucket;
}

export interface ExpirySummary {
  expired: number;
  today: number;
  threeDays: number;
  sevenDays: number;
  thirtyDays: number;
}

function startOfDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function serialize(membership: IMembership, member: { _id: Types.ObjectId; name: string; phone: string; status: string }, plan: IMembershipPlan, today: Date): ExpiryMembership {
  const end = startOfDate(membership.endDate);
  const daysLeft = Math.round((end.getTime() - today.getTime()) / 86400000);
  const bucket: ExpiryBucket = daysLeft < 0 ? "EXPIRED" : daysLeft === 0 ? "TODAY" : daysLeft <= 3 ? "THREE_DAYS" : daysLeft <= 7 ? "SEVEN_DAYS" : "THIRTY_DAYS";
  return {
    id: membership._id.toString(),
    member: { id: member._id.toString(), name: member.name, phone: member.phone, status: member.status },
    plan: { id: plan._id.toString(), name: plan.name, duration: plan.duration, durationUnit: plan.durationUnit, price: plan.price, isActive: plan.isActive },
    startDate: membership.startDate.toISOString(),
    endDate: membership.endDate.toISOString(),
    amount: membership.amount,
    weightAtStart: membership.weightAtStart,
    status: membership.status,
    daysLeft,
    bucket,
  };
}

export async function listMembershipExpiry(gymId: string, bucket?: ExpiryBucket, query?: string): Promise<{ memberships: ExpiryMembership[]; summary: ExpirySummary }> {
  await connectToDatabase();
  const today = startOfDate(new Date());
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const inThirtyDays = new Date(today); inThirtyDays.setDate(inThirtyDays.getDate() + 30);
  const filters = tenant(gymId);
  const memberFilter: Record<string, unknown> = {};
  if (query?.trim()) {
    const ids = await MemberModel.find(filters.filter({ $or: [{ name: { $regex: query.trim(), $options: "i" } }, { phone: { $regex: query.trim(), $options: "i" } }] })).distinct("_id");
    memberFilter.memberId = { $in: ids };
  }

  const dateFilter: Record<string, unknown> = { $or: [
    { endDate: { $gte: today, $lt: inThirtyDays } },
    { endDate: { $lt: today } },
  ] };
  const memberships = await MembershipModel.find(filters.filter({ status: { $ne: MEMBERSHIP_STATUS.CANCELLED }, ...memberFilter, ...dateFilter })).sort({ endDate: 1 }).lean<IMembership[]>();

  const hydrated = await Promise.all(memberships.map(async (membership) => {
    const [member, plan] = await Promise.all([
      MemberModel.findOne(filters.filter({ _id: membership.memberId })).lean(),
      MembershipPlanModel.findOne(filters.filter({ _id: membership.planId })).lean<IMembershipPlan>(),
    ]);
    return member && plan ? serialize(membership, member, plan, today) : null;
  }));

  const all = hydrated.filter((item): item is ExpiryMembership => item !== null);
  const filtered = bucket ? all.filter((item) => item.bucket === bucket) : all;
  const summary: ExpirySummary = {
    expired: all.filter((item) => item.bucket === "EXPIRED").length,
    today: all.filter((item) => item.bucket === "TODAY").length,
    threeDays: all.filter((item) => item.bucket === "THREE_DAYS").length,
    sevenDays: all.filter((item) => item.bucket === "SEVEN_DAYS").length,
    thirtyDays: all.filter((item) => item.daysLeft >= 8 && item.daysLeft <= 30).length,
  };
  return { memberships: filtered, summary };
}
