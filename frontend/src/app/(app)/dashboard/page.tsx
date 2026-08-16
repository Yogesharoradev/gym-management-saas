import {
  AlertTriangle,
  ArrowUpRight,
  CalendarCheck,
  Clock3,
  IndianRupee,
  Info,
  UserCheck,
  UserX,
  Users,
  Wallet,
} from "lucide-react";
import { requireGymContext } from "@/lib/auth/guards";
import { getGymAccessInfo } from "@/lib/auth/session";
import { getGymDashboardData } from "@/lib/data/dashboard";
import { StatCard } from "@/components/stat-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
}

function formatCurrency(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default async function DashboardPage() {
  const { user, gym } = await requireGymContext();
  const access = getGymAccessInfo(gym);
  const dashboard = await getGymDashboardData(gym.id);
  const firstName = user.name.split(" ")[0] || "there";

  const stats = [
    { key: "total-members", label: "Total Members", value: dashboard.totalMembers.toLocaleString("en-IN"), helper: "All registered", icon: Users },
    { key: "active-members", label: "Active Members", value: dashboard.activeMembers.toLocaleString("en-IN"), helper: "Member status is active", icon: UserCheck, accent: true },
    { key: "inactive-members", label: "Inactive Members", value: dashboard.inactiveMembers.toLocaleString("en-IN"), helper: "Member status is inactive", icon: UserX, tone: "rose" as const },
    { key: "expiring-soon", label: "Expiring Soon", value: dashboard.expiringSoon.toLocaleString("en-IN"), helper: "Memberships in next 7 days", icon: Clock3, tone: "amber" as const },
    { key: "expired-members", label: "Expired Members", value: dashboard.expiredMembers.toLocaleString("en-IN"), helper: "Lapsed memberships", icon: UserX, tone: "orange" as const },
    { key: "today-attendance", label: "Today's Attendance", value: dashboard.todayAttendance.toLocaleString("en-IN"), helper: "Check-ins today", icon: CalendarCheck, tone: "blue" as const },
    { key: "today-collection", label: "Today's Collection", value: formatCurrency(dashboard.todayCollection), helper: "Payments received", icon: IndianRupee, tone: "violet" as const },
    { key: "pending-payments", label: "Pending Payments", value: formatCurrency(dashboard.pendingPayments), helper: "Outstanding dues", icon: Wallet, tone: "orange" as const },
  ];

  return (
    <div className="space-y-6 sm:space-y-7">
      <section className="relative overflow-hidden rounded-[24px] border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/70 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-100px] right-40 h-52 w-52 rounded-full bg-cyan-200/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400"><span>Welcome back</span><span className="h-1 w-1 rounded-full bg-emerald-400" /><span className="text-slate-500">{gym.name}</span></div><h1 className="mt-2 font-heading text-3xl font-black tracking-[-0.04em] text-slate-900 sm:text-4xl">{firstName} <span aria-hidden="true">👋</span></h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">Here&apos;s what&apos;s happening at {gym.name} today.</p><div className="mt-5 flex flex-wrap items-center gap-2"><Badge className="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"><span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />Live data</Badge><span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[11px] font-medium text-slate-500">Updated just now</span></div></div>
          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><CalendarCheck className="h-5 w-5" /></div><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Today</p><p className="mt-0.5 text-sm font-bold text-slate-800">{formatDate(new Date().toISOString())}</p></div></div>
        </div>
      </section>

      {access.inGracePeriod ? <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 shadow-sm sm:p-5" data-testid="subscription-grace-banner"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><AlertTriangle className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-bold text-amber-950">Your subscription has expired</p><Badge className="w-fit border-amber-200 bg-white/70 text-amber-800 hover:bg-white/70">{access.graceDaysRemaining} {access.graceDaysRemaining === 1 ? "day" : "days"} remaining</Badge></div><p className="mt-1 text-sm leading-6 text-amber-800/80">Your subscription ended on {gym.subscriptionEndDate ? formatDate(gym.subscriptionEndDate) : "the expiry date"}. You are in the 7-day grace period. Please contact the administrator to renew before access is paused.</p>{access.gracePeriodEndsAt ? <p className="mt-2 text-xs font-semibold text-amber-700">Grace period ends on {formatDate(access.gracePeriodEndsAt)}.</p> : null}</div></div></div> : null}

      <section><div className="mb-3 px-0.5"><h2 className="text-base font-bold tracking-tight text-slate-900">Gym overview</h2><p className="mt-0.5 text-xs text-slate-400">Live metrics from your gym</p></div><div className="grid grid-cols-2 gap-3 xl:grid-cols-4 2xl:grid-cols-8">{stats.map((stat) => <StatCard key={stat.key} testId={`stat-${stat.key}`} label={stat.label} value={stat.value} helper={stat.helper} icon={stat.icon} accent={stat.accent} tone={stat.tone} />)}</div></section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)]">
        <Card className="overflow-hidden rounded-[22px] border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]"><CardHeader className="flex flex-row items-start justify-between space-y-0 px-5 pb-2 sm:px-6"><div><CardTitle className="text-base font-bold text-slate-900">Revenue overview</CardTitle><p className="mt-1 text-xs text-slate-400">Collection trend for the last 7 days</p></div><Badge variant="muted" className="rounded-lg border-slate-200 bg-slate-50 text-slate-500">Last 7 days</Badge></CardHeader><CardContent className="px-2 pb-5 sm:px-5 sm:pb-6"><RevenueChart data={dashboard.revenueSeries} /></CardContent></Card>
        <Card className="rounded-[22px] border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]"><CardHeader className="flex flex-row items-start justify-between space-y-0 px-5 sm:px-6"><div><CardTitle className="text-base font-bold text-slate-900">Expiring soon</CardTitle><p className="mt-1 text-xs text-slate-400">Memberships ending in 7 days</p></div><Clock3 className="mt-1 h-4 w-4 text-slate-400" /></CardHeader><CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">{dashboard.expiringMembers.length > 0 ? <div className="space-y-2">{dashboard.expiringMembers.map((member) => <div key={member.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3 transition-colors hover:border-emerald-100 hover:bg-emerald-50/30" data-testid={`expiring-member-${member.id}`}><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{member.name}</p><p className="truncate text-xs text-slate-400">{member.plan}</p></div><div className="flex shrink-0 items-center gap-1 rounded-lg bg-orange-50 px-2 py-1 text-xs font-bold text-orange-600">{member.endsIn}<ArrowUpRight className="h-3.5 w-3.5" /></div></div>)}</div> : <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 text-center"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Info className="h-5 w-5" /></div><p className="mt-3 text-sm font-semibold text-slate-700">No memberships expiring soon</p><p className="mt-1 text-xs text-slate-400">You&apos;re all caught up! 🎉</p></div>}</CardContent></Card>
      </div>
    </div>
  );
}
