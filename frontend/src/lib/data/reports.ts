import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { MemberModel } from "@/models/member.model";
import { MembershipModel } from "@/models/membership.model";
import { MembershipPlanModel } from "@/models/membership-plan.model";
import { PaymentModel, type IPayment } from "@/models/payment.model";
import { MEMBERSHIP_STATUS, MEMBER_STATUS } from "@/lib/constants";

export interface ReportsOverview {
  range: { from: string; to: string };
  members: { total: number; newMembers: number; active: number; inactive: number; frozen: number };
  memberships: { active: number; expired: number; expiring: number; byPlan: Array<{ plan: string; count: number }> };
  revenue: {
    total: number;
    paymentCount: number;
    averagePayment: number;
    byMethod: Array<{ method: string; amount: number; count: number }>;
    series: Array<{ date: string; amount: number }>;
  };
  outstanding: number;
  recentPayments: Array<{
    id: string;
    member: string;
    amount: number;
    method: string;
    paymentDate: string;
    transactionReference: string;
  }>;
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function endOfDay(value: Date): Date {
  const date = startOfDay(value);
  date.setDate(date.getDate() + 1);
  return date;
}

function parseDate(value: string | null, fallback: Date): Date {
  if (!value) return fallback;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export async function getReportsOverview(
  gymId: string,
  fromValue?: string | null,
  toValue?: string | null,
): Promise<ReportsOverview> {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(gymId)) throw new Error("Invalid gym id");

  const gymObjectId = new Types.ObjectId(gymId);
  const now = new Date();
  const today = startOfDay(now);
  const defaultTo = today;
  const defaultFrom = new Date(today);
  defaultFrom.setDate(defaultFrom.getDate() - 29);

  let from = startOfDay(parseDate(fromValue ?? null, defaultFrom));
  let to = endOfDay(parseDate(toValue ?? null, defaultTo));

  if (from >= to) {
    from = defaultFrom;
    to = endOfDay(defaultTo);
  }

  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const [
    memberStats,
    membershipStats,
    planBreakdown,
    revenueStats,
    revenueByMethod,
    revenueByDate,
    outstandingResult,
    recentPaymentDocs,
  ] = await Promise.all([
    MemberModel.aggregate<{
      total: number;
      newMembers: number;
      active: number;
      inactive: number;
      frozen: number;
    }>([
      { $match: { gymId: gymObjectId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          newMembers: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ["$joiningDate", from] }, { $lt: ["$joiningDate", to] }] },
                1,
                0,
              ],
            },
          },
          active: { $sum: { $cond: [{ $eq: ["$status", MEMBER_STATUS.ACTIVE] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ["$status", MEMBER_STATUS.INACTIVE] }, 1, 0] } },
          frozen: { $sum: { $cond: [{ $eq: ["$status", MEMBER_STATUS.FROZEN] }, 1, 0] } },
        },
      },
    ]),
    MembershipModel.aggregate<{ active: number; expired: number; expiring: number }>([
      { $match: { gymId: gymObjectId, status: { $ne: MEMBERSHIP_STATUS.CANCELLED } } },
      {
        $group: {
          _id: null,
          active: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", MEMBERSHIP_STATUS.ACTIVE] },
                    { $lte: ["$startDate", now] },
                    { $gte: ["$endDate", today] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          expired: { $sum: { $cond: [{ $lt: ["$endDate", today] }, 1, 0] } },
          expiring: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$endDate", today] },
                    { $lte: ["$endDate", sevenDaysFromNow] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
    MembershipModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      {
        $match: {
          gymId: gymObjectId,
          startDate: { $lt: to },
          endDate: { $gte: from },
          status: { $ne: MEMBERSHIP_STATUS.CANCELLED },
        },
      },
      { $group: { _id: "$planId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    PaymentModel.aggregate<{ total: number; count: number }>([
      { $match: { gymId: gymObjectId, paymentDate: { $gte: from, $lt: to } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    PaymentModel.aggregate<{ _id: string; amount: number; count: number }>([
      { $match: { gymId: gymObjectId, paymentDate: { $gte: from, $lt: to } } },
      { $group: { _id: "$paymentMethod", amount: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { amount: -1 } },
    ]),
    PaymentModel.aggregate<{ _id: string; amount: number }>([
      { $match: { gymId: gymObjectId, paymentDate: { $gte: from, $lt: to } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" } }, amount: { $sum: "$amount" } } },
      { $sort: { _id: 1 } },
    ]),
    MembershipModel.aggregate<{ total: number }>([
      { $match: { gymId: gymObjectId, status: { $ne: MEMBERSHIP_STATUS.CANCELLED } } },
      {
        $lookup: {
          from: "payments",
          let: { membershipId: "$_id", gymId: "$gymId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$membershipId", "$$membershipId"] },
                    { $eq: ["$gymId", "$$gymId"] },
                  ],
                },
              },
            },
            { $group: { _id: null, paid: { $sum: "$amount" } } },
          ],
          as: "paymentTotals",
        },
      },
      {
        $project: {
          balance: {
            $max: [
              0,
              {
                $subtract: [
                  "$amount",
                  { $ifNull: [{ $arrayElemAt: ["$paymentTotals.paid", 0] }, 0] },
                ],
              },
            ],
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]),
    PaymentModel.find({ gymId: gymObjectId, paymentDate: { $gte: from, $lt: to } })
      .sort({ paymentDate: -1, createdAt: -1 })
      .limit(10)
      .lean<IPayment[]>(),
  ]);

  const planIds = planBreakdown.map((item) => item._id);
  const plans = planIds.length
    ? await MembershipPlanModel.find({ gymId: gymObjectId, _id: { $in: planIds } })
        .lean<{ _id: Types.ObjectId; name: string }[]>()
    : [];
  const planMap = new Map(plans.map((plan) => [plan._id.toString(), plan.name]));

  const memberIds = recentPaymentDocs.map((payment) => payment.memberId);
  const members = memberIds.length
    ? await MemberModel.find({ gymId: gymObjectId, _id: { $in: memberIds } })
        .select({ name: 1 })
        .lean<{ _id: Types.ObjectId; name: string }[]>()
    : [];
  const memberMap = new Map(members.map((member) => [member._id.toString(), member.name]));

  const revenueSeriesMap = new Map(revenueByDate.map((item) => [item._id, item.amount]));
  const revenueSeries: ReportsOverview["revenue"]["series"] = [];
  for (let date = new Date(from); date < to; date.setDate(date.getDate() + 1)) {
    const key = isoDate(date);
    revenueSeries.push({ date: key, amount: revenueSeriesMap.get(key) ?? 0 });
  }

  const paymentTotal = revenueStats[0]?.total ?? 0;
  const paymentCount = revenueStats[0]?.count ?? 0;

  return {
    range: {
      from: isoDate(from),
      to: isoDate(new Date(to.getTime() - 86400000)),
    },
    members: {
      total: memberStats[0]?.total ?? 0,
      newMembers: memberStats[0]?.newMembers ?? 0,
      active: memberStats[0]?.active ?? 0,
      inactive: memberStats[0]?.inactive ?? 0,
      frozen: memberStats[0]?.frozen ?? 0,
    },
    memberships: {
      active: membershipStats[0]?.active ?? 0,
      expired: membershipStats[0]?.expired ?? 0,
      expiring: membershipStats[0]?.expiring ?? 0,
      byPlan: planBreakdown.map((item) => ({
        plan: planMap.get(item._id.toString()) ?? "Unknown plan",
        count: item.count,
      })),
    },
    revenue: {
      total: paymentTotal,
      paymentCount,
      averagePayment: paymentCount ? Math.round(paymentTotal / paymentCount) : 0,
      byMethod: revenueByMethod.map((item) => ({
        method: item._id,
        amount: item.amount,
        count: item.count,
      })),
      series: revenueSeries,
    },
    outstanding: outstandingResult[0]?.total ?? 0,
    recentPayments: recentPaymentDocs.map((payment) => ({
      id: payment._id.toString(),
      member: memberMap.get(payment.memberId.toString()) ?? "Unknown member",
      amount: payment.amount,
      method: payment.paymentMethod,
      paymentDate: payment.paymentDate.toISOString(),
      transactionReference: payment.transactionReference,
    })),
  };
}
