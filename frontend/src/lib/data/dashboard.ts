import "server-only";
import { connectToDatabase } from "@/lib/db";
import { AttendanceModel } from "@/models/attendance.model";
import { MemberModel } from "@/models/member.model";
import { MembershipModel } from "@/models/membership.model";
import { PaymentModel } from "@/models/payment.model";
import { MEMBERSHIP_STATUS, MEMBER_STATUS } from "@/lib/constants";

export interface DashboardData {
  totalMembers: number;
  activeMembers: number;
  expiringSoon: number;
  expiredMembers: number;
  todayAttendance: number;
  todayCollection: number;
  pendingPayments: number;
  revenueSeries: Array<{ day: string; revenue: number }>;
  expiringMembers: Array<{ id: string; name: string; plan: string; endsIn: string }>;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date): Date {
  const value = startOfDay(date);
  value.setDate(value.getDate() + 1);
  return value;
}

export async function getGymDashboardData(gymId: string): Promise<DashboardData> {
  await connectToDatabase();

  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = endOfDay(now);
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const [
    totalMembers,
    activeMembersResult,
    expiringSoon,
    expiredMembers,
    todayAttendance,
    todayCollectionResult,
    pendingResult,
    expiringDocs,
    revenueDocs,
  ] = await Promise.all([
    MemberModel.countDocuments({ gymId }),
    MembershipModel.aggregate<{ count: number }>([
      { $match: { gymId, status: MEMBERSHIP_STATUS.ACTIVE } },
      { $group: { _id: "$memberId" } },
      { $count: "count" },
    ]),
    MembershipModel.countDocuments({
      gymId,
      status: MEMBERSHIP_STATUS.ACTIVE,
      endDate: { $gte: now, $lte: sevenDaysFromNow },
    }),
    MembershipModel.countDocuments({ gymId, status: MEMBERSHIP_STATUS.EXPIRED }),
    AttendanceModel.countDocuments({
      gymId,
      date: { $gte: todayStart, $lt: tomorrowStart },
    }),
    PaymentModel.aggregate<{ total: number }>([
      { $match: { gymId, paymentDate: { $gte: todayStart, $lt: tomorrowStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    MembershipModel.aggregate<{ total: number }>([
      { $match: { gymId, status: { $ne: MEMBERSHIP_STATUS.CANCELLED } } },
      {
        $lookup: {
          from: "payments",
          let: { membershipId: "$_id", gymId: "$gymId" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$membershipId", "$$membershipId"] }, { $eq: ["$gymId", "$$gymId"] }] } } },
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
              { $subtract: ["$amount", { $ifNull: [{ $arrayElemAt: ["$paymentTotals.paid", 0] }, 0] }] },
            ],
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]),
    MembershipModel.aggregate<{
      _id: unknown;
      memberId: unknown;
      endDate: Date;
      member: Array<{ name: string }>;
      plan: Array<{ name: string }>;
    }>([
      { $match: { gymId, status: MEMBERSHIP_STATUS.ACTIVE, endDate: { $gte: now, $lte: sevenDaysFromNow } } },
      { $sort: { endDate: 1 } },
      { $limit: 6 },
      { $lookup: { from: "members", localField: "memberId", foreignField: "_id", as: "member" } },
      { $lookup: { from: "membershipplans", localField: "planId", foreignField: "_id", as: "plan" } },
    ]),
    PaymentModel.aggregate<{ _id: string; revenue: number }>([
      { $match: { gymId, paymentDate: { $gte: new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000), $lt: tomorrowStart } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" } },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const revenueByDate = new Map(revenueDocs.map((item) => [item._id, item.revenue]));
  const revenueSeries = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(todayStart);
    date.setDate(todayStart.getDate() - (6 - index));
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return {
      day: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date),
      revenue: revenueByDate.get(key) ?? 0,
    };
  });

  const expiringMembers = expiringDocs.map((item) => {
    const endDate = new Date(item.endDate);
    const days = Math.max(1, Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    return {
      id: String(item._id),
      name: item.member[0]?.name ?? "Unknown member",
      plan: item.plan[0]?.name ?? "Membership",
      endsIn: `${days} ${days === 1 ? "day" : "days"}`,
    };
  });

  return {
    totalMembers,
    activeMembers: activeMembersResult[0]?.count ?? 0,
    expiringSoon,
    expiredMembers,
    todayAttendance,
    todayCollection: todayCollectionResult[0]?.total ?? 0,
    pendingPayments: pendingResult[0]?.total ?? 0,
    revenueSeries,
    expiringMembers,
  };
}
