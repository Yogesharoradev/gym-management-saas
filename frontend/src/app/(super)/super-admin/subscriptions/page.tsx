import {
  CheckCircle2,
  AlertTriangle,
  Ban,
  XCircle,
  Info,
  TrendingUp,
  CreditCard,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { getPlatformOverview } from "@/lib/data/platform";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatCurrencyINR } from "@/lib/utils";
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
    <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`} />
      <CardContent className="p-5 pl-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
    cancelled: {
      classes:
        "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
      label: "Cancelled",
    },
  };

  const config = configs[status.toLowerCase()] || {
    classes:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    label: status,
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

/* ─── Breakdown Row ─── */
function BreakdownRow({
  status,
  count,
  total,
  icon: Icon,
  color,
}: {
  status: string;
  count: number;
  total: number;
  icon: React.ElementType;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div
      className="flex items-center gap-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 px-5 py-4"
      data-testid={`subscription-breakdown-${status.toLowerCase()}`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <StatusBadge status={status} />
          <span className="font-heading text-xl font-black text-slate-900 dark:text-white">
            {count}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <Progress
            value={percentage}
            className="h-1.5 flex-1 mr-3 bg-slate-100 dark:bg-slate-800"
          />
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default async function SuperAdminSubscriptionsPage() {
  await requireSuperAdmin();
  const overview = await getPlatformOverview();
  const sampleMrr = overview.activeGyms * SAMPLE_ARPA;

  const total =
    overview.activeGyms +
    overview.pastDueGyms +
    overview.suspendedGyms +
    overview.cancelledGyms;

  const breakdown = [
    {
      status: "ACTIVE",
      count: overview.activeGyms,
      icon: CheckCircle2,
      color: "bg-emerald-500",
    },
    {
      status: "PAST_DUE",
      count: overview.pastDueGyms,
      icon: AlertTriangle,
      color: "bg-amber-500",
    },
    {
      status: "SUSPENDED",
      count: overview.suspendedGyms,
      icon: Ban,
      color: "bg-rose-500",
    },
    {
      status: "CANCELLED",
      count: overview.cancelledGyms,
      icon: XCircle,
      color: "bg-slate-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Platform
            </span>
          </div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Subscriptions
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Monitor subscription health and revenue metrics.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs border-slate-200 dark:border-slate-700 w-fit"
        >
          <Calendar className="mr-1.5 h-3.5 w-3.5" />
          Last 30 days
        </Button>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active"
          value={String(overview.activeGyms)}
          helper="Paying gyms"
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
          label="Cancelled"
          value={String(overview.cancelledGyms)}
          helper="Churned gyms"
          icon={XCircle}
          accentColor="bg-slate-500"
        />
      </div>

      {/* ─── Breakdown + MRR ─── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Status Breakdown */}
        <Card className="lg:col-span-2 border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900">
          <CardHeader className="pb-5 pt-6 px-6">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Status Breakdown
            </CardTitle>
            <CardDescription className="text-xs mt-1 text-slate-500 dark:text-slate-400">
              Distribution of gyms by subscription status
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-3">
            {breakdown.map((item) => (
              <BreakdownRow
                key={item.status}
                status={item.status}
                count={item.count}
                total={total}
                icon={item.icon}
                color={item.color}
              />
            ))}
          </CardContent>
        </Card>

        {/* MRR Card */}
        <div className="space-y-4">
          <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500" />
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Est. MRR
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-violet-500" />
                <p className="font-heading text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {formatCurrencyINR(sampleMrr)}
                </p>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Active gyms
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {overview.activeGyms}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    ARPA
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrencyINR(SAMPLE_ARPA)}
                  </span>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="h-3 w-3" />
                    <span className="font-semibold">+15%</span>
                    <span className="text-slate-400 dark:text-slate-500">
                      vs last month
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start h-9 text-xs border-slate-200 dark:border-slate-700"
              >
                <Zap className="mr-2 h-3.5 w-3.5" />
                Send payment reminders
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-9 text-xs border-slate-200 dark:border-slate-700"
              >
                <CreditCard className="mr-2 h-3.5 w-3.5" />
                View billing history
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Info Banner ─── */}
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-5 py-4 text-xs">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Coming Soon
          </p>
          <p className="mt-1 text-slate-500 dark:text-slate-500 leading-relaxed">
            Subscription billing, invoices and plan management are not
            implemented yet. These figures are foundational placeholders.
          </p>
        </div>
      </div>
    </div>
  );
}
