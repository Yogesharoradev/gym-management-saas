import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { AttendanceModel } from "@/models/attendance.model";
import { MemberModel } from "@/models/member.model";
import { MembershipModel, type IMembership } from "@/models/membership.model";
import { MembershipPlanModel } from "@/models/membership-plan.model";
import { PaymentModel } from "@/models/payment.model";
import { MEMBERSHIP_STATUS, MEMBER_STATUS } from "@/lib/constants";

export interface DashboardData { totalMembers: number; activeMembers: number; inactiveMembers: number; expiringSoon: number; expiredMembers: number; todayAttendance: number; todayCollection: number; pendingPayments: number; revenueSeries: Array<{ day: string; revenue: number }>; expiringMembers: Array<{ id: string; name: string; plan: string; endsIn: string }>; }
function startOfDay(date: Date): Date { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function endOfDay(date: Date): Date { const value = startOfDay(date); value.setDate(value.getDate() + 1); return value; }

export async function getGymDashboardData(gymId: string): Promise<DashboardData> {
  await connectToDatabase(); if (!Types.ObjectId.isValid(gymId)) throw new Error("Invalid gym id");
  const tenantId = new Types.ObjectId(gymId); const now = new Date(); const todayStart = startOfDay(now); const tomorrowStart = endOfDay(now); const sevenDaysFromNow = new Date(now); sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const latestMemberships = await MembershipModel.aggregate<IMembership>([
    { $match: { gymId: tenantId } },
    { $sort: { memberId: 1, endDate: -1, startDate: -1, createdAt: -1 } },
    { $group: { _id: "$memberId", membership: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$membership" } },
  ]);
  const visibleMemberships = latestMemberships.filter((membership) => membership.status !== MEMBERSHIP_STATUS.CANCELLED);
  const displayedStatus = (membership: IMembership): string => membership.status === MEMBERSHIP_STATUS.CANCELLED ? MEMBERSHIP_STATUS.CANCELLED : membership.endDate < todayStart ? MEMBERSHIP_STATUS.EXPIRED : membership.status;
  const activeMemberships = visibleMemberships.filter((membership) => displayedStatus(membership) === MEMBERSHIP_STATUS.ACTIVE && membership.startDate <= now && membership.endDate >= todayStart);
  const expiringMemberships = activeMemberships.filter((membership) => membership.endDate <= sevenDaysFromNow);
  const expiredMemberships = visibleMemberships.filter((membership) => displayedStatus(membership) === MEMBERSHIP_STATUS.EXPIRED);

  const [totalMembers, activeMembers, inactiveMembers, todayAttendance, todayCollectionResult, pendingResult, expiringDocs, revenueDocs] = await Promise.all([
    MemberModel.countDocuments({ gymId: tenantId }),
    MemberModel.countDocuments({ gymId: tenantId, status: MEMBER_STATUS.ACTIVE }),
    MemberModel.countDocuments({ gymId: tenantId, status: MEMBER_STATUS.INACTIVE }),
    AttendanceModel.countDocuments({ gymId: tenantId, date: { $gte: todayStart, $lt: tomorrowStart } }),
    PaymentModel.aggregate<{ total: number }>([{ $match: { gymId: tenantId, paymentDate: { $gte: todayStart, $lt: tomorrowStart } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    MembershipModel.aggregate<{ total: number }>([{ $match: { gymId: tenantId, status: { $ne: MEMBERSHIP_STATUS.CANCELLED } } }, { $lookup: { from: "payments", let: { membershipId: "$_id", gymId: "$gymId" }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$membershipId", "$$membershipId"] }, { $eq: ["$gymId", "$$gymId"] }] } } }, { $group: { _id: null, paid: { $sum: "$amount" } } }], as: "paymentTotals" } }, { $project: { balance: { $max: [0, { $subtract: ["$amount", { $ifNull: [{ $arrayElemAt: ["$paymentTotals.paid", 0] }, 0] }] }] } } }, { $group: { _id: null, total: { $sum: "$balance" } } }]),
    Promise.resolve(expiringMemberships.slice().sort((a, b) => a.endDate.getTime() - b.endDate.getTime()).slice(0, 6)),
    PaymentModel.aggregate<{ _id: string; revenue: number }>([{ $match: { gymId: tenantId, paymentDate: { $gte: new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000), $lt: tomorrowStart } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" } }, revenue: { $sum: "$amount" } } }, { $sort: { _id: 1 } }]),
  ]);

  const revenueByDate = new Map(revenueDocs.map((item) => [item._id, item.revenue]));
  const revenueSeries = Array.from({ length: 7 }, (_, index) => { const date = new Date(todayStart); date.setDate(todayStart.getDate() - (6 - index)); const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; return { day: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date), revenue: revenueByDate.get(key) ?? 0 }; });
  const expiringMembers = await Promise.all(expiringDocs.map(async (membership) => { const [member, plan] = await Promise.all([MemberModel.findOne({ _id: membership.memberId, gymId: tenantId }).lean<{ name: string }>(), MembershipPlanModel.findOne({ _id: membership.planId, gymId: tenantId }).lean<{ name: string }>()]); const days = Math.max(0, Math.ceil((new Date(membership.endDate).getTime() - todayStart.getTime()) / 86400000)); return { id: membership._id.toString(), name: member?.name ?? "Unknown member", plan: plan?.name ?? "Membership", endsIn: days === 0 ? "Today" : `${days} ${days === 1 ? "day" : "days"}` }; }));
  return { totalMembers, activeMembers, inactiveMembers, expiringSoon: expiringMemberships.length, expiredMembers: expiredMemberships.length, todayAttendance, todayCollection: todayCollectionResult[0]?.total ?? 0, pendingPayments: pendingResult[0]?.total ?? 0, revenueSeries, expiringMembers };
}
