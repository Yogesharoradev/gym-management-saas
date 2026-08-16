import "server-only";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { MemberModel, type IMember } from "@/models/member.model";
import { MembershipModel } from "@/models/membership.model";
import { MembershipPlanModel } from "@/models/membership-plan.model";
import { tenant } from "@/lib/data/tenant";
import type { MemberInput, UpdateMemberInput } from "@/lib/validation/member";
import { MEMBER_STATUS, type MemberStatus } from "@/lib/constants";

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
  membership: {
    id: string;
    plan: string;
    startDate: string;
    endDate: string;
    amount: number;
    status: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

function serializeDate(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

export function serializeMember(member: IMember, membership: SerializedMember["membership"] = null): SerializedMember {
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

async function getMembership(gymId: string, memberId: string): Promise<SerializedMember["membership"]> {
  const membership = await MembershipModel.findOne(tenant(gymId).filter({ memberId })).sort({ endDate: -1 }).lean();
  if (!membership) return null;
  const plan = await MembershipPlanModel.findOne(tenant(gymId).filter({ _id: membership.planId })).lean();
  return {
    id: membership._id.toString(),
    plan: plan?.name ?? "Membership plan",
    startDate: membership.startDate.toISOString(),
    endDate: membership.endDate.toISOString(),
    amount: membership.amount,
    status: membership.status,
  };
}

export async function listMembers(
  gymId: string,
  options: { query?: string; status?: MemberStatus; page?: number; pageSize?: number } = {},
): Promise<{ members: SerializedMember[]; total: number; page: number; pageSize: number }> {
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
  const [members, total] = await Promise.all([
    MemberModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean<IMember[]>(),
    MemberModel.countDocuments(filter),
  ]);
  const serialized = await Promise.all(members.map(async (member) => serializeMember(member, await getMembership(gymId, member._id.toString()))));
  return { members: serialized, total, page, pageSize };
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
  const member = await MemberModel.create({
    ...input,
    gymId: tenant(gymId).gymId,
    dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
    joiningDate: new Date(input.joiningDate),
    status: MEMBER_STATUS.ACTIVE,
  });
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
