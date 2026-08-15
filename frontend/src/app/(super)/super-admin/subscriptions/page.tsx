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
  Wallet,
  Users,
  Receipt,
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
import { Button } from "@/components/ui/button";
import { formatCurrencyINR } from "@/lib/utils";
import { MonthlyAdminFee } from "@/lib/constants";

export const dynamic = "force-dynamic";

const SAMPLE_ARPA = MonthlyAdminFee;

/* ─── Status Dot Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const configs: Record<
    string,
    { dot: string; bg: string; text: string; label: string }
  > = {
    active: {
      dot: "bg-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-700 dark:text-emerald-400",
      label: "Active",
    },
    past_due: {
      dot: "bg-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      text: "text-amber-700 dark:text-amber-400",
      label: "Past Due",
    },
    suspended: {
      dot: "bg-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      text: "text-rose-700 dark:text-rose-400",
      label: "Suspended",
    },
    cancelled: {
      dot: "bg-slate-400",
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-400",
      label: "Cancelled",
    },
  };
  const config = configs[normalized] || configs.cancelled;
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </div>
  );
}

/* ─── Animated Stat Card ─── */
function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  trend,
  trendUp,
  gradient,
  iconBg,
  delay = 0,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  gradient: string;
  iconBg: string;
  delay?: number;
}) {
  return (
    <div
      className="animate-fade-in-up group relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-sm transition-all duration-500 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/20"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${gradient}`} />
      <div className="p-5 pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {label}
            </p>
            <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
              {value}
            </p>
            <div className="flex items-center gap-2">
              {trend && (
                <span
                  className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${trendUp ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"}`}
                >
                  {trendUp ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {trend}
                </span>
              )}
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {helper}
              </p>
            </div>
          </div>
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Breakdown Row ─── */
function BreakdownRow({
  status,
  count,
  total,
  icon: Icon,
  gradient,
  delay = 0,
}: {
  status: string;
  count: number;
  total: number;
  icon: React.ElementType;
  gradient: string;
  delay?: number;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div
      className="animate-slide-in group flex items-center gap-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 px-5 py-4 transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${gradient} shadow-sm transition-transform duration-300 group-hover:scale-110`}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <StatusBadge status={status} />
          <span className="font-heading text-xl font-black text-slate-900 dark:text-white tabular-nums">
            {count}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${gradient} animate-grow-width`}
              style={{
                width: `${percentage}%`,
                animationDelay: `${delay + 300}ms`,
              }}
            />
          </div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tabular-nums w-8 text-right">
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

  const activePct =
    total > 0 ? Math.round((overview.activeGyms / total) * 100) : 0;
  const pastDuePct =
    total > 0 ? Math.round((overview.pastDueGyms / total) * 100) : 0;
  const suspendedPct =
    total > 0 ? Math.round((overview.suspendedGyms / total) * 100) : 0;
  const cancelledPct =
    total > 0 ? Math.round((overview.cancelledGyms / total) * 100) : 0;

  const breakdown = [
    {
      status: "ACTIVE",
      count: overview.activeGyms,
      icon: CheckCircle2,
      gradient: "bg-gradient-to-r from-emerald-400 to-teal-500",
    },
    {
      status: "PAST_DUE",
      count: overview.pastDueGyms,
      icon: AlertTriangle,
      gradient: "bg-gradient-to-r from-amber-400 to-orange-500",
    },
    {
      status: "SUSPENDED",
      count: overview.suspendedGyms,
      icon: Ban,
      gradient: "bg-gradient-to-r from-rose-400 to-pink-500",
    },
    {
      status: "CANCELLED",
      count: overview.cancelledGyms,
      icon: XCircle,
      gradient: "bg-gradient-to-r from-slate-400 to-slate-500",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ─── CSS Animations ─── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes growWidth {
          from { width: 0; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-in {
          animation: slideIn 0.4s ease-out forwards;
          opacity: 0;
        }
        .animate-grow-width {
          animation: growWidth 1s ease-out forwards;
        }
      `}</style>

      {/* ─── Page Header ─── */}
      <div
        className="animate-fade-in-up flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        style={{ animationDelay: "0ms" }}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
              <CreditCard className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
        <Badge
          variant="secondary"
          className="h-9 px-3 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
        >
          <Calendar className="mr-1.5 h-3.5 w-3.5" />
          Last 30 days
        </Badge>
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
          gradient="bg-gradient-to-r from-emerald-400 to-teal-500"
          iconBg="bg-gradient-to-br from-emerald-400 to-teal-600"
          delay={0}
        />
        <StatCard
          label="Past Due"
          value={String(overview.pastDueGyms)}
          helper="Payment overdue"
          icon={AlertTriangle}
          trend="-2%"
          trendUp={false}
          gradient="bg-gradient-to-r from-amber-400 to-orange-500"
          iconBg="bg-gradient-to-br from-amber-400 to-orange-600"
          delay={80}
        />
        <StatCard
          label="Suspended"
          value={String(overview.suspendedGyms)}
          helper="Access paused"
          icon={Ban}
          gradient="bg-gradient-to-r from-rose-400 to-pink-500"
          iconBg="bg-gradient-to-br from-rose-400 to-pink-600"
          delay={160}
        />
        <StatCard
          label="Cancelled"
          value={String(overview.cancelledGyms)}
          helper="Churned gyms"
          icon={XCircle}
          gradient="bg-gradient-to-r from-slate-400 to-slate-600"
          iconBg="bg-gradient-to-br from-slate-400 to-slate-600"
          delay={240}
        />
      </div>

      {/* ─── Main Content ─── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ─── Status Breakdown ─── */}
        <div
          className="animate-fade-in-up lg:col-span-2 space-y-6"
          style={{ animationDelay: "300ms" }}
        >
          <Card className="border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4 pt-6 px-6">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/20">
                  <Users className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                </div>
                Status Breakdown
              </CardTitle>
              <CardDescription className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                Distribution of {total} gyms by subscription status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Visual Stacked Bar */}
              <div className="space-y-2">
                <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner bg-slate-100 dark:bg-slate-800">
                  {activePct > 0 && (
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 animate-grow-width"
                      style={{ width: `${activePct}%` }}
                    />
                  )}
                  {pastDuePct > 0 && (
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 animate-grow-width"
                      style={{
                        width: `${pastDuePct}%`,
                        animationDelay: "200ms",
                      }}
                    />
                  )}
                  {suspendedPct > 0 && (
                    <div
                      className="h-full bg-gradient-to-r from-rose-400 to-pink-500 animate-grow-width"
                      style={{
                        width: `${suspendedPct}%`,
                        animationDelay: "400ms",
                      }}
                    />
                  )}
                  {cancelledPct > 0 && (
                    <div
                      className="h-full bg-gradient-to-r from-slate-400 to-slate-500 animate-grow-width"
                      style={{
                        width: `${cancelledPct}%`,
                        animationDelay: "600ms",
                      }}
                    />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px]">
                  {activePct > 0 && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Active {activePct}%
                    </span>
                  )}
                  {pastDuePct > 0 && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      Past Due {pastDuePct}%
                    </span>
                  )}
                  {suspendedPct > 0 && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <span className="h-2 w-2 rounded-full bg-rose-400" />
                      Suspended {suspendedPct}%
                    </span>
                  )}
                  {cancelledPct > 0 && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      Cancelled {cancelledPct}%
                    </span>
                  )}
                </div>
              </div>

              {/* Detail Rows */}
              <div className="space-y-3">
                {breakdown.map((item, i) => (
                  <BreakdownRow
                    key={item.status}
                    status={item.status}
                    count={item.count}
                    total={total}
                    icon={item.icon}
                    gradient={item.gradient}
                    delay={i * 100}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Right Sidebar ─── */}
        <div
          className="animate-fade-in-up space-y-6"
          style={{ animationDelay: "400ms" }}
        >
          {/* MRR Card */}
          <Card className="border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/20">
                  <Wallet className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                </div>
                Est. MRR
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-5">
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-4xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {formatCurrencyINR(sampleMrr)}
                </span>
                <span className="text-sm text-slate-400">/mo</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Users className="h-3.5 w-3.5" />
                    Active gyms
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                    {overview.activeGyms}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Receipt className="h-3.5 w-3.5" />
                    ARPA
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatCurrencyINR(SAMPLE_ARPA)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  +15%
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  vs last month
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start h-10 text-xs font-medium border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
              >
                <Zap className="mr-2 h-3.5 w-3.5 text-amber-500" />
                Send payment reminders
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-10 text-xs font-medium border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
              >
                <CreditCard className="mr-2 h-3.5 w-3.5 text-violet-500" />
                View billing history
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Info Banner ─── */}
      <div
        className="animate-fade-in-up flex items-start gap-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-5 py-4 text-xs"
        style={{ animationDelay: "500ms" }}
      >
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
