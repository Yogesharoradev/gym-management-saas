import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { AttendanceModel } from "@/models/attendance.model";
import { MemberModel } from "@/models/member.model";
import { MembershipModel } from "@/models/membership.model";
import { MembershipPlanModel } from "@/models/membership-plan.model";
import { PaymentModel } from "@/models/payment.model";
import { MEMBERSHIP_STATUS, MEMBER_STATUS } from "@/lib/constants";

export interface ReportsOverview {
  range: { from: string; to: string };
  members: { total: number; newMembers: number; active: number; inactive: number; frozen: number };
  memberships: { active: number; expired: number; expiring: number; byPlan: Array<{ plan: string; count: number }> };
  revenue: { total: number; averagePayment: number; byMethod: Array<{ method: string; amount: number }> ; series: Array<{ date: string; amount: number }> };
  attendance: { checkIns: number; uniqueMembers: number; series: Array<{ date: string; count: number }> };
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
  const defaultTo = startOfDay(now);
  const defaultFrom = new Date(defaultTo);
  defaultFrom.setDate(defaultFrom.getDate() - 29);

  let from = startOfDay(parseDate(fromValue ?? null, defaultFrom));
  let to = endOfDay(parseDate(toValue ?? null, defaultTo));
  if (from >= to) {
    from = defaultFrom;
    to = endOfDay(defaultTo);
  }

  const [memberStats, membershipStats, planBreakdown, revenueStats, revenueByMethod, attendanceStats, attendanceByDate] = await Promise.all([
    MemberModel.aggregate<{ total: number; newMembers: number; active: number; inactive: number; frozen: number }>([
      { $match: { gymId: gymObjectId } },
      { $group: { _id: null, total: { $sum: 1 }, newMembers: { $sum: { $cond: [{ $and: [{ $gte: ["$joiningDate", from] }, { $lt: ["$joiningDate", to] }] }, 1, 0] } }, active: { $sum: { $cond: [{ $eq: ["$status", MEMBER_STATUS.ACTIVE] }, 1, 0] } }, inactive: { $sum: { $cond: [{ $eq: ["$status", MEMBER_STATUS.INACTIVE] }, 1, 0] } }, frozen: { $sum: { $cond: [{ $eq: ["$status", MEMBER_STATUS.FROZEN] }, 1, 0] } } } },
    ]),
    MembershipModel.aggregate<{ active: number; expired: number; expiring: number }>([
      { $match: { gymId: gymObjectId, status: { $ne: MEMBERSHIP_STATUS.CANCELLED } } },
      { $group: { _id: null, active: { $sum: { $cond: [{ $and: [{ $eq: ["$status", MEMBERSHIP_STATUS.ACTIVE] }, { $lte: ["$startDate", now] }, { $gte: ["$endDate", startOfDay(now)] }] }, 1, 0] } }, expired: { $sum: { $cond: [{ $lt: ["$endDate", startOfDay(now)] }, 1, 0] } }, expiring: { $sum: { $cond: [{ $and: [{ $gte: ["$endDate", startOfDay(now)] }, { $lte: ["$endDate", new Date(startOfDay(now).getTime() + 7 * 86400000)] }] }, 1, 0] } } } },
    ]),
    MembershipModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { gymId: gymObjectId, startDate: { $lt: to }, endDate: { $gte: from }, status: { $ne: MEMBERSHIP_STATUS.CANCELLED } } },
      { $group: { _id: "$planId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    PaymentModel.aggregate<{ total: number; count: number }>([
      { $match: { gymId: gymObjectId, paymentDate: { $gte: from, $lt: to } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    PaymentModel.aggregate<{ _id: string; amount: number }>([
      { $match: { gymId: gymObjectId, paymentDate: { $gte: from, $lt: to } } },
      { $group: { _id: "$paymentMethod", amount: { $sum: "$amount" } } },
      { $sort: { amount: -1 } },
    ]),
    AttendanceModel.aggregate<{ checkIns: number; uniqueMembers: Types.ObjectId[] }>([
      { $match: { gymId: gymObjectId, date: { $gte: from, $lt: to } } },
      { $group: { _id: null, checkIns: { $sum: 1 }, uniqueMembers: { $addToSet: "$memberId" } } },
    ]),
    AttendanceModel.aggregate<{ _id: string; count: number }>([
      { $match: { gymId: gymObjectId, date: { $gte: from, $lt: to } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const planIds = planBreakdown.map((item) => item._id);
  const plans = planIds.length ? await MembershipPlanModel.find({ gymId: gymObjectId, _id: { $in: planIds } }).lean<{ _id: Types.ObjectId; name: string }[]>() : [];
  const planMap = new Map(plans.map((plan) => [plan._id.toString(), plan.name]));

  const revenueMap = new Map(revenueByMethod.map((item) => [item._id, item.amount]));
  const revenueSeriesMap = new Map((await PaymentModel.aggregate<{ _id: string; amount: number }>([
    { $match: { gymId: gymObjectId, paymentDate: { $gte: from, $lt: to } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" } }, amount: { $sum: "$amount" } } },
    { $sort: { _id: 1 } },
  ])).map((item) => [item._id, item.amount]));

  const revenueSeries: ReportsOverview["revenue"]["series"] = [];
  const attendanceSeries: ReportsOverview["attendance"]["series"] = [];
  for (let date = new Date(from); date < to; date.setDate(date.getDate() + 1)) {
    const key = isoDate(date);
    revenueSeries.push({ date: key, amount: revenueSeriesMap.get(key) ?? 0 });
    attendanceSeries.push({ date: key, count: attendanceByDate.find((item) => item._id === key)?.count ?? 0 });
  }

  const paymentTotal = revenueStats[0]?.total ?? 0;
  const paymentCount = revenueStats[0]?.count ?? 0;
  const attendance = attendanceStats[0];

  return {
    range: { from: isoDate(from), to: isoDate(new Date(to.getTime() - 86400000)) },
    members: { total: memberStats[0]?.total ?? 0, newMembers: memberStats[0]?.newMembers ?? 0, active: memberStats[0]?.active ?? 0, inactive: memberStats[0]?.inactive ?? 0, frozen: memberStats[0]?.frozen ?? 0 },
    memberships: { active: membershipStats[0]?.active ?? 0, expired: membershipStats[0]?.expired ?? 0, expiring: membershipStats[0]?.expiring ?? 0, byPlan: planBreakdown.map((item) => ({ plan: planMap.get(item._id.toString()) ?? "Unknown plan", count: item.count })) },
    revenue: { total: paymentTotal, averagePayment: paymentCount ? Math.round(paymentTotal / paymentCount) : 0, byMethod: Array.from(revenueMap, ([method, amount]) => ({ method, amount })), series: revenueSeries },
    attendance: { checkIns: attendance?.checkIns ?? 0, uniqueMembers: attendance?.uniqueMembers?.length ?? 0, series: attendanceSeries },
  };
}
