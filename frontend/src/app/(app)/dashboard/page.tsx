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

  const stats = [
    { key: "total-members", label: "Total Members", value: dashboard.totalMembers.toLocaleString("en-IN"), helper: "All registered members", icon: Users },
    { key: "active-members", label: "Active Members", value: dashboard.activeMembers.toLocaleString("en-IN"), helper: "Members with active plans", icon: UserCheck, accent: true },
    { key: "expiring-soon", label: "Expiring Soon", value: dashboard.expiringSoon.toLocaleString("en-IN"), helper: "Renewals due in 7 days", icon: Clock3 },
    { key: "expired-members", label: "Expired Members", value: dashboard.expiredMembers.toLocaleString("en-IN"), helper: "Lapsed memberships", icon: UserX },
    { key: "today-attendance", label: "Today's Attendance", value: dashboard.todayAttendance.toLocaleString("en-IN"), helper: "Check-ins recorded today", icon: CalendarCheck },
    { key: "today-collection", label: "Today's Collection", value: formatCurrency(dashboard.todayCollection), helper: "Payments received today", icon: IndianRupee, accent: true },
    { key: "pending-payments", label: "Pending Payments", value: formatCurrency(dashboard.pendingPayments), helper: "Outstanding membership dues", icon: Wallet },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="overline">{gym.name}</p>
            <h2 className="mt-1 font-heading text-2xl font-black tracking-tighter sm:text-3xl">
              Welcome back, {user.name.split(" ")[0]}.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Here&apos;s what&apos;s happening across your gym today.
            </p>
          </div>
          <Badge variant="muted" className="w-fit">Live data</Badge>
        </div>
      </section>

      {access.inGracePeriod ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100" data-testid="subscription-grace-banner">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <p className="text-sm font-semibold">Your subscription has expired</p>
                <Badge className="w-fit border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                  {access.graceDaysRemaining} {access.graceDaysRemaining === 1 ? "day" : "days"} remaining
                </Badge>
              </div>
              <p className="mt-1 text-sm leading-6 text-amber-800/90 dark:text-amber-200/80">
                Your subscription ended on {gym.subscriptionEndDate ? formatDate(gym.subscriptionEndDate) : "the expiry date"}. You are in the 7-day grace period. Please contact the administrator to renew before access is paused.
              </p>
              {access.gracePeriodEndsAt ? <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">Grace period ends on {formatDate(access.gracePeriodEndsAt)}.</p> : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.key} testId={`stat-${stat.key}`} label={stat.label} value={stat.value} helper={stat.helper} icon={stat.icon} accent={stat.accent} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6">
            <div>
              <CardTitle>Revenue</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Last 7 days</p>
            </div>
            <Badge variant="muted">Live</Badge>
          </CardHeader>
          <CardContent className="px-2 pb-4 sm:px-6 sm:pb-6">
            <RevenueChart data={dashboard.revenueSeries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Expiring Soon</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Next 7 days</p>
            </div>
            <Clock3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboard.expiringMembers.length > 0 ? dashboard.expiringMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 transition-colors hover:border-foreground/20" data-testid={`expiring-member-${member.id}`}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{member.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{member.plan}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
                  {member.endsIn}<ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            )) : (
              <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 text-center">
                <Info className="h-5 w-5 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No memberships expiring soon</p>
                <p className="mt-1 text-xs text-muted-foreground">You&apos;re all clear for the next 7 days.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
