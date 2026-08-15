"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Ban,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CreditCard,
  Calendar,
  ArrowRight,
  Users,
  Wallet,
} from "lucide-react";
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

interface Gym {
  id: string;
  name: string;
  email: string | null;
  subscriptionStatus: string;
  subscriptionEndDate: string | null;
  createdAt: string;
}

interface Overview {
  totalGyms: number;
  activeGyms: number;
  pastDueGyms: number;
  suspendedGyms: number;
  gyms: Gym[];
}

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      <Card className="relative border-0 shadow-sm bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all duration-500">
        <div className={`absolute inset-x-0 top-0 h-1 ${gradient}`} />
        <CardContent className="p-5 pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {label}
              </p>
              <motion.p
                className="text-3xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: delay + 0.15,
                }}
              >
                {value}
              </motion.p>
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
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} shadow-sm`}
            >
              <Icon className="h-5 w-5 text-white" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Insight Card with Animated Progress ─── */
function InsightCard({
  title,
  value,
  subtitle,
  icon: Icon,
  progress,
  gradient,
  delay = 0,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  progress: number;
  gradient: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-md transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${gradient} shadow-sm`}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {title}
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {value}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {subtitle}
              </span>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                {progress}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{
                  duration: 1.2,
                  delay: delay + 0.3,
                  ease: "easeOut",
                }}
                className={`h-full rounded-full ${gradient}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Table Row ─── */
function GymTableRow({ gym, index }: { gym: Gym; index: number }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
      className="group border-b border-slate-100 dark:border-slate-800/80 transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
    >
      <TableCell className="pl-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border-2 border-white dark:border-slate-700 shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
              {gym.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors duration-200 truncate">
              {gym.name}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[180px]">
              {gym.email || "No email provided"}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <StatusBadge status={gym.subscriptionStatus} />
      </TableCell>
      <TableCell className="py-4">
        <span className="text-sm text-slate-500 dark:text-slate-400 tabular-nums">
          {gym.subscriptionEndDate ? formatDate(gym.subscriptionEndDate) : "—"}
        </span>
      </TableCell>
      <TableCell className="py-4">
        <span className="text-sm text-slate-500 dark:text-slate-400 tabular-nums">
          {formatDate(gym.createdAt)}
        </span>
      </TableCell>
      <TableCell className="pr-6 py-4 text-right">
        <Link href={`/super-admin/gyms/${gym.id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs text-slate-400 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            View
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </TableCell>
    </motion.tr>
  );
}

/* ─── Main View ─── */
export function OverviewClientView({ overview }: { overview: Overview }) {
  const sampleMrr = overview.activeGyms * MonthlyAdminFee;
  const activeRate =
    overview.totalGyms > 0
      ? Math.round((overview.activeGyms / overview.totalGyms) * 100)
      : 0;
  const pastDueRate =
    overview.totalGyms > 0
      ? Math.round((overview.pastDueGyms / overview.totalGyms) * 100)
      : 0;

  const stats = [
    {
      label: "Total Gyms",
      value: String(overview.totalGyms),
      helper: "All registered",
      icon: Building2,
      trend: "+12%",
      trendUp: true,
      gradient: "bg-gradient-to-r from-violet-500 to-purple-500",
      iconBg: "bg-gradient-to-br from-violet-400 to-purple-600",
    },
    {
      label: "Active Gyms",
      value: String(overview.activeGyms),
      helper: "Paying customers",
      icon: CheckCircle2,
      trend: "+8%",
      trendUp: true,
      gradient: "bg-gradient-to-r from-emerald-400 to-teal-500",
      iconBg: "bg-gradient-to-br from-emerald-400 to-teal-600",
    },
    {
      label: "Past Due",
      value: String(overview.pastDueGyms),
      helper: "Payment overdue",
      icon: AlertTriangle,
      trend: "-2%",
      trendUp: false,
      gradient: "bg-gradient-to-r from-amber-400 to-orange-500",
      iconBg: "bg-gradient-to-br from-amber-400 to-orange-600",
    },
    {
      label: "Suspended",
      value: String(overview.suspendedGyms),
      helper: "Access paused",
      icon: Ban,
      gradient: "bg-gradient-to-r from-rose-400 to-pink-500",
      iconBg: "bg-gradient-to-br from-rose-400 to-pink-600",
    },
    {
      label: "Est. MRR",
      value: formatCurrencyINR(sampleMrr),
      helper: "Monthly revenue",
      icon: TrendingUp,
      trend: "+15%",
      trendUp: true,
      gradient: "bg-gradient-to-r from-slate-500 to-slate-600",
      iconBg: "bg-gradient-to-br from-slate-400 to-slate-600",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
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
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
          >
            <Calendar className="mr-1 h-3 w-3" />
            Last 30 days
          </Badge>
        </div>
      </motion.div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i * 0.08} />
        ))}
      </div>

      {/* ─── Insights Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <InsightCard
          title="Active Rate"
          value={`${activeRate}%`}
          subtitle="Active vs Total Gyms"
          icon={Activity}
          progress={activeRate}
          gradient="bg-gradient-to-r from-emerald-400 to-teal-500"
          delay={0.4}
        />
        <InsightCard
          title="Past Due Rate"
          value={`${pastDueRate}%`}
          subtitle="Overdue vs Total"
          icon={CreditCard}
          progress={pastDueRate}
          gradient="bg-gradient-to-r from-amber-400 to-orange-500"
          delay={0.5}
        />
        <InsightCard
          title="Avg. Tenure"
          value="4.2 mo"
          subtitle="Gym lifetime on platform"
          icon={Calendar}
          progress={42}
          gradient="bg-gradient-to-r from-violet-400 to-purple-500"
          delay={0.6}
        />
      </div>

      {/* ─── Recent Gyms Table ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="border border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-5 pt-6 px-6 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Recent Gyms
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 tabular-nums">
                  {overview.gyms.length}
                </span>
              </CardTitle>
              <CardDescription className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                Latest gyms that joined your platform
              </CardDescription>
            </div>
            <Link href="/super-admin/gyms">
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
              >
                View All
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
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
                    <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-6 w-[35%]">
                        Gym
                      </TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Subscription
                      </TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Renews
                      </TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Joined
                      </TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pr-6 text-right" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.gyms.slice(0, 8).map((gym, index) => (
                      <GymTableRow key={gym.id} gym={gym} index={index} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
