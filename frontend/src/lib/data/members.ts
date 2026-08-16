import "server-only";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { MemberModel, type IMember } from "@/models/member.model";
import { MembershipModel } from "@/models/membership.model";
import { MembershipPlanModel } from "@/models/membership-plan.model";
import { tenant } from "@/lib/data/tenant";
import type { MemberInput, UpdateMemberInput } from "@/lib/validation/member";
import { MEMBER_STATUS, MEMBERSHIP_STATUS, type MemberStatus, type MembershipStatus } from "@/lib/constants";

export interface SerializedMemberMembership {
  id: string;
  plan: string;
  startDate: string;
  endDate: string;
  amount: number;
  weightAtStart: number | null;
  status: MembershipStatus;
}

export interface SerializedMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  dateOfBirth: string | null;
  address: string;
  emergencyContact: string;
  photo: string | null;
  joiningDate: string;
  status: MemberStatus;
  membership: SerializedMemberMembership | null;
  createdAt: string;
  updatedAt: string;
}

export interface MemberListStats {
  total: number;
  active: number;
  frozen: number;
  inactive: number;
  withMembership: number;
}

export interface MemberProfileData {
  member: SerializedMember;
  membershipHistory: SerializedMemberMembership[];
}

function serializeDate(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

export function serializeMember(member: IMember, membership: SerializedMemberMembership | null = null): SerializedMember {
  return {
    id: member._id.toString(),
    name: member.name,
    phone: member.phone,
    email: member.email,
    gender: member.gender,
    dateOfBirth: serializeDate(member.dateOfBirth),
    address: member.address,
    emergencyContact: member.emergencyContact,
    photo: member.photo,
    joiningDate: member.joiningDate.toISOString(),
    status: member.status,
    membership,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  };
}

async function serializeMembership(gymId: string, membership: { _id: { toString(): string }; planId: unknown; startDate: Date; endDate: Date; amount: number; weightAtStart: number | null; status: MembershipStatus }): Promise<SerializedMemberMembership> {
  const plan = await MembershipPlanModel.findOne(tenant(gymId).filter({ _id: membership.planId })).lean();
  const displayedStatus: MembershipStatus = membership.status === MEMBERSHIP_STATUS.CANCELLED
    ? MEMBERSHIP_STATUS.CANCELLED
    : membership.endDate < new Date()
      ? MEMBERSHIP_STATUS.EXPIRED
      : membership.status;
  return {
    id: membership._id.toString(),
    plan: plan?.name ?? "Membership plan",
    startDate: membership.startDate.toISOString(),
    endDate: membership.endDate.toISOString(),
    amount: membership.amount,
    weightAtStart: membership.weightAtStart,
    status: displayedStatus,
  };
}

async function getMembership(gymId: string, memberId: string): Promise<SerializedMemberMembership | null> {
  const membership = await MembershipModel.findOne(tenant(gymId).filter({ memberId })).sort({ startDate: -1, endDate: -1, createdAt: -1 }).lean();
  if (!membership) return null;
  return serializeMembership(gymId, membership);
}

export async function getMemberProfileData(gymId: string, memberId: string): Promise<MemberProfileData | null> {
  if (!isValidObjectId(memberId)) return null;
  await connectToDatabase();
  const member = await MemberModel.findOne(tenant(gymId).filter({ _id: memberId })).lean<IMember>();
  if (!member) return null;
  const memberships = await MembershipModel.find(tenant(gymId).filter({ memberId })).sort({ startDate: -1, endDate: -1, createdAt: -1 }).lean();
  const history = await Promise.all(memberships.map((membership) => serializeMembership(gymId, membership)));
  return { member: serializeMember(member, history[0] ?? null), membershipHistory: history };
}

export async function listMembers(
  gymId: string,
  options: { query?: string; status?: MemberStatus; page?: number; pageSize?: number } = {},
): Promise<{ members: SerializedMember[]; total: number; page: number; pageSize: number; stats: MemberListStats }> {
  await connectToDatabase();
  const pageSize = Math.min(Math.max(options.pageSize ?? 12, 1), 50);
  const page = Math.max(options.page ?? 1, 1);
  const filters = tenant(gymId);
  const extra: Record<string, unknown> = {};
  if (options.status) extra.status = options.status;
  if (options.query?.trim()) {
    const query = options.query.trim();
    extra.$or = [
      { name: { $regex: query, $options: "i" } },
      { phone: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ];
  }
  const filter = filters.filter(extra);
  const [members, total, active, frozen, inactive, memberIdsWithMembership] = await Promise.all([
    MemberModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean<IMember[]>(),
    filters.count(MemberModel),
    filters.count(MemberModel, { status: MEMBER_STATUS.ACTIVE }),
    filters.count(MemberModel, { status: MEMBER_STATUS.FROZEN }),
    filters.count(MemberModel, { status: MEMBER_STATUS.INACTIVE }),
    MembershipModel.distinct("memberId", filters.filter({})),
  ]);
  const serialized = await Promise.all(members.map(async (member) => serializeMember(member, await getMembership(gymId, member._id.toString()))));
  return { members: serialized, total, page, pageSize, stats: { total, active, frozen, inactive, withMembership: memberIdsWithMembership.length } };
}

export async function getMemberById(gymId: string, memberId: string): Promise<SerializedMember | null> {
  if (!isValidObjectId(memberId)) return null;
  await connectToDatabase();
  const member = await MemberModel.findOne(tenant(gymId).filter({ _id: memberId })).lean<IMember>();
  if (!member) return null;
  return serializeMember(member, await getMembership(gymId, memberId));
}

export async function createMember(gymId: string, input: MemberInput): Promise<SerializedMember> {
  await connectToDatabase();
  const member = await MemberModel.create({ ...input, gymId: tenant(gymId).gymId, dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null, joiningDate: new Date(input.joiningDate), status: MEMBER_STATUS.ACTIVE });
  return serializeMember(member);
}

export async function updateMember(gymId: string, memberId: string, input: UpdateMemberInput): Promise<SerializedMember | null> {
  if (!isValidObjectId(memberId)) return null;
  await connectToDatabase();
  const update: Record<string, unknown> = { ...input };
  if (input.dateOfBirth !== undefined) update.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : null;
  if (input.joiningDate !== undefined) update.joiningDate = new Date(input.joiningDate);
  const member = await MemberModel.findOneAndUpdate(tenant(gymId).filter({ _id: memberId }), { $set: update }, { new: true, runValidators: true }).lean<IMember>();
  if (!member) return null;
  return serializeMember(member, await getMembership(gymId, memberId));
}

export async function setMemberStatus(gymId: string, memberId: string, status: MemberStatus): Promise<SerializedMember | null> {
  if (!isValidObjectId(memberId)) return null;
  await connectToDatabase();
  const member = await MemberModel.findOneAndUpdate(tenant(gymId).filter({ _id: memberId }), { $set: { status } }, { new: true, runValidators: true }).lean<IMember>();
  if (!member) return null;
  return serializeMember(member, await getMembership(gymId, memberId));
}
