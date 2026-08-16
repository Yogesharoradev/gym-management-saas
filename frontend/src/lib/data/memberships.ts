import "server-only";
import { isValidObjectId } from "mongoose";
import { MembershipModel, type IMembership } from "@/models/membership.model";
import { MembershipPlanModel, type IMembershipPlan } from "@/models/membership-plan.model";
import { MemberModel } from "@/models/member.model";
import { tenant } from "@/lib/data/tenant";
import { MEMBER_STATUS, MEMBERSHIP_STATUS, type MembershipStatus } from "@/lib/constants";
import type { MembershipInput, MembershipPlanInput, UpdateMembershipInput, UpdateMembershipPlanInput } from "@/lib/validation/membership";

export interface SerializedMembershipPlan { id: string; name: string; duration: number; durationUnit: string; price: number; description: string; isActive: boolean; createdAt: string; updatedAt: string; }
export interface SerializedMembership { id: string; member: { id: string; name: string; phone: string; status: string }; plan: SerializedMembershipPlan; startDate: string; endDate: string; amount: number; weightAtStart: number | null; status: MembershipStatus; createdAt: string; }
export interface MembershipStats { total: number; active: number; expiring: number; expired: number; cancelled: number; }
function serializePlan(plan: IMembershipPlan): SerializedMembershipPlan { return { id: plan._id.toString(), name: plan.name, duration: plan.duration, durationUnit: plan.durationUnit, price: plan.price, description: plan.description, isActive: plan.isActive, createdAt: plan.createdAt.toISOString(), updatedAt: plan.updatedAt.toISOString() }; }
function serializeMembership(membership: IMembership, member: { _id: { toString(): string }; name: string; phone: string; status: string }, plan: IMembershipPlan): SerializedMembership { const displayedStatus: MembershipStatus = membership.status === MEMBERSHIP_STATUS.CANCELLED ? MEMBERSHIP_STATUS.CANCELLED : membership.endDate < new Date() ? MEMBERSHIP_STATUS.EXPIRED : membership.status; return { id: membership._id.toString(), member: { id: member._id.toString(), name: member.name, phone: member.phone, status: member.status }, plan: serializePlan(plan), startDate: membership.startDate.toISOString(), endDate: membership.endDate.toISOString(), amount: membership.amount, weightAtStart: membership.weightAtStart, status: displayedStatus, createdAt: membership.createdAt.toISOString() }; }

export async function listMembershipPlans(gymId: string): Promise<SerializedMembershipPlan[]> { await connectToDatabase(); const plans = await MembershipPlanModel.find(tenant(gymId).filter({})).sort({ isActive: -1, createdAt: -1 }).lean<IMembershipPlan[]>(); return plans.map(serializePlan); }
export async function createMembershipPlan(gymId: string, input: MembershipPlanInput): Promise<SerializedMembershipPlan> { await connectToDatabase(); const existing = await MembershipPlanModel.findOne(tenant(gymId).filter({ name: input.name })).lean(); if (existing) throw new Error("A membership plan with this name already exists"); const plan = await MembershipPlanModel.create({ ...input, gymId: tenant(gymId).gymId }); return serializePlan(plan); }
export async function updateMembershipPlan(gymId: string, planId: string, input: UpdateMembershipPlanInput): Promise<SerializedMembershipPlan | null> { if (!isValidObjectId(planId)) return null; await connectToDatabase(); const plan = await MembershipPlanModel.findOneAndUpdate(tenant(gymId).filter({ _id: planId }), { $set: input }, { new: true, runValidators: true }).lean<IMembershipPlan>(); return plan ? serializePlan(plan) : null; }

export async function listMemberships(gymId: string, options: { query?: string; status?: MembershipStatus; page?: number; pageSize?: number } = {}): Promise<{ memberships: SerializedMembership[]; total: number; page: number; pageSize: number; stats: MembershipStats }> {
  await connectToDatabase();
  const pageSize = Math.min(Math.max(options.pageSize ?? 12, 1), 50); const page = Math.max(options.page ?? 1, 1); const filters = tenant(gymId); const now = new Date(); const sevenDays = new Date(now); sevenDays.setDate(sevenDays.getDate() + 7);
  const extra: Record<string, unknown> = {};
  if (options.status === MEMBERSHIP_STATUS.ACTIVE) extra.$or = [{ status: MEMBERSHIP_STATUS.ACTIVE, endDate: { $gte: now } }];
  else if (options.status === MEMBERSHIP_STATUS.EXPIRED) extra.$or = [{ status: MEMBERSHIP_STATUS.EXPIRED }, { status: MEMBERSHIP_STATUS.ACTIVE, endDate: { $lt: now } }];
  else if (options.status) extra.status = options.status;
  if (options.query?.trim()) { const ids = await MemberModel.find(tenant(gymId).filter({ $or: [{ name: { $regex: options.query.trim(), $options: "i" } }, { phone: { $regex: options.query.trim(), $options: "i" } }] })).distinct("_id"); extra.memberId = { $in: ids }; }
  const filter = filters.filter(extra);
  const [memberships, total, active, expiring, expired, cancelled] = await Promise.all([
    MembershipModel.find(filter).sort({ startDate: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean<IMembership[]>(),
    filters.count(MembershipModel, extra),
    filters.count(MembershipModel, { status: MEMBERSHIP_STATUS.ACTIVE, endDate: { $gte: now } }),
    filters.count(MembershipModel, { status: MEMBERSHIP_STATUS.ACTIVE, endDate: { $gte: now, $lte: sevenDays } }),
    filters.count(MembershipModel, { $or: [{ status: MEMBERSHIP_STATUS.EXPIRED }, { status: MEMBERSHIP_STATUS.ACTIVE, endDate: { $lt: now } }] }),
    filters.count(MembershipModel, { status: MEMBERSHIP_STATUS.CANCELLED }),
  ]);
  const hydrated = await Promise.all(memberships.map(async (membership) => { const [member, plan] = await Promise.all([MemberModel.findOne(tenant(gymId).filter({ _id: membership.memberId })).lean(), MembershipPlanModel.findOne(tenant(gymId).filter({ _id: membership.planId })).lean<IMembershipPlan>()]); return member && plan ? serializeMembership(membership, member, plan) : null; }));
  return { memberships: hydrated.filter((item): item is SerializedMembership => item !== null), total, page, pageSize, stats: { total, active, expiring, expired, cancelled } };
}

export async function createMembership(gymId: string, input: MembershipInput): Promise<SerializedMembership> {
  if (!isValidObjectId(input.memberId) || !isValidObjectId(input.planId)) throw new Error("Invalid member or membership plan"); await connectToDatabase();
  const [member, plan] = await Promise.all([MemberModel.findOne(tenant(gymId).filter({ _id: input.memberId })).lean(), MembershipPlanModel.findOne(tenant(gymId).filter({ _id: input.planId })).lean<IMembershipPlan>()]);
  if (!member) throw new Error("Member not found"); if (!plan || !plan.isActive) throw new Error("Membership plan is unavailable");
  const startDate = new Date(input.startDate); const endDate = new Date(input.endDate);
  const overlap = await MembershipModel.findOne(tenant(gymId).filter({ memberId: input.memberId, status: MEMBERSHIP_STATUS.ACTIVE, startDate: { $lte: endDate }, endDate: { $gte: startDate } })).lean();
  if (overlap) throw new Error("This member already has an overlapping active membership");
  const membership = await MembershipModel.create({ gymId: tenant(gymId).gymId, memberId: member._id, planId: plan._id, startDate, endDate, amount: input.amount, weightAtStart: input.weightAtStart, status: MEMBERSHIP_STATUS.ACTIVE });
  if (member.status !== MEMBER_STATUS.ACTIVE) await MemberModel.updateOne(tenant(gymId).filter({ _id: member._id }), { $set: { status: MEMBER_STATUS.ACTIVE } });
  return serializeMembership(membership, member, plan);
}

export async function updateMembership(gymId: string, membershipId: string, input: UpdateMembershipInput): Promise<SerializedMembership | null> {
  if (!isValidObjectId(membershipId)) return null; await connectToDatabase(); const existing = await MembershipModel.findOne(tenant(gymId).filter({ _id: membershipId })).lean<IMembership>(); if (!existing) return null;
  const nextPlanId = input.planId ?? existing.planId.toString(); if (!isValidObjectId(nextPlanId)) throw new Error("Invalid membership plan");
  const [plan, member] = await Promise.all([MembershipPlanModel.findOne(tenant(gymId).filter({ _id: nextPlanId })).lean<IMembershipPlan>(), MemberModel.findOne(tenant(gymId).filter({ _id: existing.memberId })).lean()]);
  if (!member) throw new Error("Member not found"); if (!plan) throw new Error("Membership plan not found"); if (input.planId && !plan.isActive && plan._id.toString() !== existing.planId.toString()) throw new Error("Membership plan is unavailable");
  const startDate = input.startDate ? new Date(input.startDate) : existing.startDate; const endDate = input.endDate ? new Date(input.endDate) : existing.endDate; if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) throw new Error("Invalid membership dates"); if (endDate < startDate) throw new Error("End date must be on or after start date");
  if (existing.status === MEMBERSHIP_STATUS.ACTIVE) { const overlap = await MembershipModel.findOne(tenant(gymId).filter({ _id: { $ne: membershipId }, memberId: existing.memberId, status: MEMBERSHIP_STATUS.ACTIVE, startDate: { $lte: endDate }, endDate: { $gte: startDate } })).lean(); if (overlap) throw new Error("This member already has another overlapping active membership"); }
  const update: Record<string, unknown> = {}; if (input.planId) update.planId = plan._id; if (input.startDate) update.startDate = startDate; if (input.endDate) update.endDate = endDate; if (input.amount !== undefined) update.amount = input.amount; if (input.weightAtStart !== undefined) update.weightAtStart = input.weightAtStart; if (input.status) update.status = input.status;
  const membership = await MembershipModel.findOneAndUpdate(tenant(gymId).filter({ _id: membershipId }), { $set: update }, { new: true, runValidators: true }).lean<IMembership>(); if (!membership) return null;
  const hydratedPlan = input.planId ? plan : await MembershipPlanModel.findOne(tenant(gymId).filter({ _id: membership.planId })).lean<IMembershipPlan>(); return hydratedPlan ? serializeMembership(membership, member, hydratedPlan) : null;
}

export async function setMembershipStatus(gymId: string, membershipId: string, status: MembershipStatus): Promise<SerializedMembership | null> {
  if (!isValidObjectId(membershipId)) return null; await connectToDatabase(); const membership = await MembershipModel.findOneAndUpdate(tenant(gymId).filter({ _id: membershipId }), { $set: { status } }, { new: true, runValidators: true }).lean<IMembership>(); if (!membership) return null;
  const [member, plan] = await Promise.all([MemberModel.findOne(tenant(gymId).filter({ _id: membership.memberId })).lean(), MembershipPlanModel.findOne(tenant(gymId).filter({ _id: membership.planId })).lean<IMembershipPlan>()]); return member && plan ? serializeMembership(membership, member, plan) : null;
}
