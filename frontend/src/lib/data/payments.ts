import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { MemberModel } from "@/models/member.model";
import { MembershipModel } from "@/models/membership.model";
import { MembershipPlanModel } from "@/models/membership-plan.model";
import { PaymentModel, type IPayment } from "@/models/payment.model";
import { GymModel } from "@/models/gym.model";
import { tenant } from "@/lib/data/tenant";

export interface FeeRecord {
  id: string;
  memberId: string;
  memberName: string;
  phone: string;
  membershipId: string | null;
  planName: string;
  membershipAmount: number;
  amount: number;
  method: string;
  paymentDate: string;
  transactionReference: string;
  notes: string;
  outstanding: number;
}

export interface FeeRecordsResult {
  payments: FeeRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listFeeRecords(
  gymId: string,
  options: { query?: string; method?: string; from?: string; to?: string; page?: number; pageSize?: number } = {},
): Promise<FeeRecordsResult> {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(gymId)) throw new Error("Invalid gym id");

  const pageSize = Math.min(Math.max(options.pageSize ?? 15, 1), 50);
  const page = Math.max(options.page ?? 1, 1);
  const memberIds = options.query?.trim()
    ? await MemberModel.find(
        tenant(gymId).filter({
          $or: [
            { name: { $regex: options.query.trim(), $options: "i" } },
            { phone: { $regex: options.query.trim(), $options: "i" } },
          ],
        }),
      ).distinct("_id")
    : null;

  const paymentFilter: Record<string, unknown> = tenant(gymId).filter({});
  if (memberIds) paymentFilter.memberId = { $in: memberIds };
  if (options.method) paymentFilter.paymentMethod = options.method;
  if (options.from || options.to) {
    const paymentDate: Record<string, Date> = {};
    if (options.from) paymentDate.$gte = new Date(`${options.from}T00:00:00`);
    if (options.to) {
      const end = new Date(`${options.to}T00:00:00`);
      end.setDate(end.getDate() + 1);
      paymentDate.$lt = end;
    }
    paymentFilter.paymentDate = paymentDate;
  }

  const [docs, total] = await Promise.all([
    PaymentModel.find(paymentFilter)
      .sort({ paymentDate: -1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean<IPayment[]>(),
    PaymentModel.countDocuments(paymentFilter),
  ]);

  const memberIdsForPage = [...new Set(docs.map((payment) => payment.memberId.toString()))];
  const membershipIds = [...new Set(docs.filter((payment) => payment.membershipId).map((payment) => payment.membershipId!.toString()))];

  const [members, memberships, plans] = await Promise.all([
    memberIdsForPage.length
      ? MemberModel.find(tenant(gymId).filter({ _id: { $in: memberIdsForPage } })).select({ name: 1, phone: 1 }).lean()
      : [],
    membershipIds.length
      ? MembershipModel.find(tenant(gymId).filter({ _id: { $in: membershipIds } })).lean()
      : [],
    membershipIds.length
      ? MembershipModel.find(tenant(gymId).filter({ _id: { $in: membershipIds } })).distinct("planId")
      : [],
  ]);

  const planDocs = plans.length
    ? await MembershipPlanModel.find(tenant(gymId).filter({ _id: { $in: plans } })).select({ name: 1 }).lean()
    : [];
  const memberMap = new Map(members.map((member) => [member._id.toString(), member]));
  const membershipMap = new Map(memberships.map((membership) => [membership._id.toString(), membership]));
  const planMap = new Map(planDocs.map((plan) => [plan._id.toString(), plan.name]));

  const paidByMembership = membershipIds.length
    ? await PaymentModel.aggregate<{ _id: Types.ObjectId; paid: number }>([
        { $match: { gymId: new Types.ObjectId(gymId), membershipId: { $in: membershipIds.map((id) => new Types.ObjectId(id)) } } },
        { $group: { _id: "$membershipId", paid: { $sum: "$amount" } } },
      ])
    : [];
  const paidMap = new Map(paidByMembership.map((item) => [item._id.toString(), item.paid]));

  return {
    payments: docs.map((payment) => {
      const member = memberMap.get(payment.memberId.toString());
      const membership = payment.membershipId ? membershipMap.get(payment.membershipId.toString()) : undefined;
      const paid = payment.membershipId ? paidMap.get(payment.membershipId.toString()) ?? payment.amount : payment.amount;
      return {
        id: payment._id.toString(),
        memberId: payment.memberId.toString(),
        memberName: member?.name ?? "Unknown member",
        phone: member?.phone ?? "",
        membershipId: payment.membershipId?.toString() ?? null,
        planName: membership ? planMap.get(membership.planId.toString()) ?? "Membership" : "—",
        membershipAmount: membership?.amount ?? payment.amount,
        amount: payment.amount,
        method: payment.paymentMethod,
        paymentDate: payment.paymentDate.toISOString(),
        transactionReference: payment.transactionReference,
        notes: payment.notes,
        outstanding: membership ? Math.max(0, membership.amount - paid) : 0,
      };
    }),
    total,
    page,
    pageSize,
  };
}

export async function getReceiptData(gymId: string, paymentId: string) {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(gymId) || !Types.ObjectId.isValid(paymentId)) return null;
  const payment = await PaymentModel.findOne(tenant(gymId).filter({ _id: paymentId })).lean<IPayment>();
  if (!payment) return null;
  const [member, membership, gym] = await Promise.all([
    MemberModel.findOne(tenant(gymId).filter({ _id: payment.memberId })).lean(),
    payment.membershipId ? MembershipModel.findOne(tenant(gymId).filter({ _id: payment.membershipId })).lean() : null,
    GymModel.findById(gymId).lean(),
  ]);
  if (!member || !gym) return null;
  const plan = membership
    ? await MembershipPlanModel.findOne(tenant(gymId).filter({ _id: membership.planId })).lean()
    : null;
  const paid = membership
    ? await PaymentModel.aggregate<{ total: number }>([
        { $match: { gymId: new Types.ObjectId(gymId), membershipId: membership._id } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
    : [];
  const totalPaid = paid[0]?.total ?? payment.amount;
  return {
    receiptNumber: `FIT-${payment._id.toString().slice(-8).toUpperCase()}`,
    gym: { name: gym.name, phone: gym.phone, email: gym.email, address: gym.address },
    member: { name: member.name, phone: member.phone },
    planName: plan?.name ?? "Membership",
    startDate: membership?.startDate ?? null,
    endDate: membership?.endDate ?? null,
    membershipAmount: membership?.amount ?? payment.amount,
    amountPaid: payment.amount,
    totalPaid,
    outstanding: membership ? Math.max(0, membership.amount - totalPaid) : 0,
    method: payment.paymentMethod,
    paymentDate: payment.paymentDate,
    transactionReference: payment.transactionReference,
  };
}
