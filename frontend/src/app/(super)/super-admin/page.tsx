import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Ban,
  TrendingUp,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  CreditCard,
  Activity,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { getPlatformOverview } from "@/lib/data/platform";
import { EmptyState } from "@/components/empty-state";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { MonthlyAdminFee } from "@/lib/constants";

export const dynamic = "force-dynamic";

const SAMPLE_ARPA = MonthlyAdminFee;

/* ─── Stat Card ─── */
function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  trend,
  trendUp,
  accentColor,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  accentColor: string;
}) {
  return (
    <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/20">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`} />
      <CardContent className="p-5 pl-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {label}
            </p>
            <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {value}
            </p>
            <div className="flex items-center gap-2">
              {trend && (
                <span
                  className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                    trendUp
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                  }`}
                >
                  {trendUp ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {trend}
                </span>
              )}
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {helper}
              </p>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Mini Insight Card ─── */
function InsightCard({
  title,
  value,
  subtitle,
  icon: Icon,
  progress,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  progress: number;
  color: string;
}) {
  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}
          >
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {title}
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {value}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {subtitle}
            </span>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              {progress}%
            </span>
          </div>
          <Progress
            value={progress}
            className="h-1.5 bg-slate-100 dark:bg-slate-800"
          />
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { classes: string; label: string }> = {
    active: {
      classes:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
      label: "Active",
    },
    past_due: {
      classes:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
      label: "Past Due",
    },
    suspended: {
      classes:
        "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",
      label: "Suspended",
    },
  };

  const config = configs[status] || {
    classes:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    label: status.replace("_", " "),
  };

  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-semibold capitalize ${config.classes}`}
    >
      {config.label}
    </Badge>
  );
}

export default async function SuperAdminOverviewPage() {
  await requireSuperAdmin();
  const overview = await getPlatformOverview();
  const sampleMrr = overview.activeGyms * SAMPLE_ARPA;

  const activeRate =
    overview.totalGyms > 0
      ? Math.round((overview.activeGyms / overview.totalGyms) * 100)
      : 0;

  const pastDueRate =
    overview.totalGyms > 0
      ? Math.round((overview.pastDueGyms / overview.totalGyms) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Live Data
            </span>
          </div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Platform Overview
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Real-time insights into your gym management platform.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-fit text-xs h-9 border-slate-200 dark:border-slate-700"
        >
          <Calendar className="mr-1.5 h-3.5 w-3.5" />
          Last 30 days
        </Button>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Total Gyms"
          value={String(overview.totalGyms)}
          helper="All registered"
          icon={Building2}
          trend="+12%"
          trendUp
          accentColor="bg-emerald-500"
        />
        <StatCard
          label="Active Gyms"
          value={String(overview.activeGyms)}
          helper="Paying customers"
          icon={CheckCircle2}
          trend="+8%"
          trendUp
          accentColor="bg-emerald-500"
        />
        <StatCard
          label="Past Due"
          value={String(overview.pastDueGyms)}
          helper="Payment overdue"
          icon={AlertTriangle}
          trend="-2%"
          trendUp={false}
          accentColor="bg-amber-500"
        />
        <StatCard
          label="Suspended"
          value={String(overview.suspendedGyms)}
          helper="Access paused"
          icon={Ban}
          accentColor="bg-rose-500"
        />
        <StatCard
          label="Est. MRR"
          value={formatCurrencyINR(sampleMrr)}
          helper="Placeholder"
          icon={TrendingUp}
          trend="+15%"
          trendUp
          accentColor="bg-violet-500"
        />
      </div>

      {/* ─── Insights Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <InsightCard
          title="Active Rate"
          value={`${activeRate}%`}
          subtitle="Active vs Total Gyms"
          icon={Activity}
          progress={activeRate}
          color="bg-emerald-500"
        />
        <InsightCard
          title="Past Due Rate"
          value={`${pastDueRate}%`}
          subtitle="Overdue vs Total"
          icon={CreditCard}
          progress={pastDueRate}
          color="bg-amber-500"
        />
        <InsightCard
          title="Avg. Tenure"
          value="4.2 mo"
          subtitle="Gym lifetime on platform"
          icon={Calendar}
          progress={42}
          color="bg-violet-500"
        />
      </div>

      {/* ─── Recent Gyms Table ─── */}
      <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-5 pt-6 px-6">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Recent Gyms
            </CardTitle>
            <CardDescription className="text-xs mt-1 text-slate-500 dark:text-slate-400">
              Latest gyms that joined your platform
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            {overview.totalGyms} total
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {overview.gyms.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Building2}
                title="No gyms yet"
                description="Gyms that sign up to the platform will appear here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-6 w-[35%]">
                      Gym
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Subscription
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Renews
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Joined
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.gyms.slice(0, 8).map((gym) => (
                    <TableRow
                      key={gym.id}
                      data-testid={`gym-row-${gym.id}`}
                      className="group border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                            <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold">
                              {gym.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                              {gym.name}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {gym.email || "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <StatusBadge status={gym.subscriptionStatus} />
                      </TableCell>
                      <TableCell className="py-4 text-sm text-slate-500 dark:text-slate-400">
                        {gym.subscriptionEndDate
                          ? formatDate(gym.subscriptionEndDate)
                          : "—"}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(gym.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
