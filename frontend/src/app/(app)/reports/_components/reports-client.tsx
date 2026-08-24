"use client";

import * as React from "react";
import useSWR from "swr";
import {
  CalendarDays,
  CreditCard,
  IndianRupee,
  RefreshCw,
  ReceiptText,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Activity,
  Minus,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Report {
  range: { from: string; to: string };
  members: {
    total: number;
    newMembers: number;
    active: number;
    inactive: number;
    frozen: number;
  };
  memberships: {
    active: number;
    expired: number;
    expiring: number;
    byPlan: Array<{ plan: string; count: number }>;
  };
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

interface ResponseData {
  report?: Report;
  error?: string;
}

type RangePreset =
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "LAST_3_MONTHS"
  | "THIS_YEAR"
  | "CUSTOM";

const fetcher = async (url: string): Promise<ResponseData> => {
  const response = await fetch(url);
  const data = (await response.json()) as ResponseData;
  if (!response.ok) throw new Error(data.error ?? "Unable to load reports");
  return data;
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function dateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function formatDay(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}

function formatPaymentDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function methodLabel(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

/* ─── Custom Tooltip for Chart ─── */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <p className="text-[11px] font-semibold text-slate-400">
        {formatDay(String(label))}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-900">
        {money.format(Number(payload[0].value))}
      </p>
    </div>
  );
}

/* ─── Skeleton Components ─── */
function SkeletonCard() {
  return (
    <Card className="rounded-2xl border-slate-200/60 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-7 w-24 animate-pulse rounded-lg bg-slate-100" />
      </div>
      <div className="mt-4 h-4 w-20 animate-pulse rounded bg-slate-100" />
    </Card>
  );
}

function SkeletonChart() {
  return (
    <div className="h-[280px] w-full animate-pulse rounded-2xl bg-slate-100" />
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-16 w-full animate-pulse rounded-xl bg-slate-100"
        />
      ))}
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="space-y-3">
      <div className="h-8 w-full animate-pulse rounded-lg bg-slate-100" />
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-14 w-full animate-pulse rounded-lg bg-slate-100"
        />
      ))}
    </div>
  );
}

function SkeletonSnapshot() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-20 w-full animate-pulse rounded-xl bg-slate-100"
        />
      ))}
    </div>
  );
}

/* ─── Empty State ─── */
function EmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ElementType;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-5 w-5 text-slate-300" />
      </div>
      <p className="mt-3 text-sm font-medium text-slate-400">{message}</p>
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  isLoading,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  isLoading?: boolean;
  accent: string;
}) {
  const accentMap: Record<string, { bg: string; text: string; light: string }> =
    {
      emerald: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        light: "text-emerald-700",
      },
      blue: { bg: "bg-blue-50", text: "text-blue-600", light: "text-blue-700" },
      amber: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        light: "text-amber-700",
      },
      rose: { bg: "bg-rose-50", text: "text-rose-600", light: "text-rose-700" },
      violet: {
        bg: "bg-violet-50",
        text: "text-violet-600",
        light: "text-violet-700",
      },
      cyan: { bg: "bg-cyan-50", text: "text-cyan-600", light: "text-cyan-700" },
    };
  const colors = accentMap[accent] ?? accentMap.emerald;

  return (
    <Card className="group relative overflow-hidden rounded-2xl border-slate-200/60 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300/80">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.bg} ${colors.text} transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="h-5 w-5" />
        </div>
        {trend && !isLoading && (
          <div
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-bold ${
              trend === "up"
                ? "bg-emerald-50 text-emerald-700"
                : trend === "down"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : trend === "down" ? (
              <ArrowDownRight className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {trendValue}
          </div>
        )}
      </div>
      <div className="mt-4">
        {isLoading ? (
          <div className="h-8 w-28 animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <p className="text-2xl font-black tracking-tight text-slate-900">
            {value}
          </p>
        )}
        <p className="mt-1 text-xs font-semibold text-slate-400">{label}</p>
      </div>
      <div
        className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${colors.bg} opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-60`}
      />
    </Card>
  );
}

export function ReportsClient() {
  const today = React.useMemo(() => new Date(), []);
  const [preset, setPreset] = React.useState<RangePreset>("THIS_MONTH");

  const defaultFrom = React.useMemo(
    () => dateInput(startOfMonth(today)),
    [today],
  );
  const defaultTo = React.useMemo(() => dateInput(today), [today]);
  const [from, setFrom] = React.useState(defaultFrom);
  const [to, setTo] = React.useState(defaultTo);

  const applyPreset = React.useCallback(
    (nextPreset: RangePreset): void => {
      setPreset(nextPreset);
      if (nextPreset === "CUSTOM") return;

      const current = new Date(today);
      let nextFrom = startOfMonth(current);
      let nextTo = current;

      if (nextPreset === "LAST_MONTH") {
        const previous = new Date(
          current.getFullYear(),
          current.getMonth() - 1,
          1,
        );
        nextFrom = startOfMonth(previous);
        nextTo = endOfMonth(previous);
      } else if (nextPreset === "LAST_3_MONTHS") {
        nextFrom = new Date(current.getFullYear(), current.getMonth() - 2, 1);
      } else if (nextPreset === "THIS_YEAR") {
        nextFrom = new Date(current.getFullYear(), 0, 1);
      }

      setFrom(dateInput(nextFrom));
      setTo(dateInput(nextTo));
    },
    [today],
  );

  const key = `/api/reports?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<ResponseData>(
    key,
    fetcher,
    {
      keepPreviousData: true,
    },
  );
  const report = data?.report;

  const presetOptions: Array<{
    value: Exclude<RangePreset, "CUSTOM">;
    label: string;
  }> = [
    { value: "THIS_MONTH", label: "This Month" },
    { value: "LAST_MONTH", label: "Last Month" },
    { value: "LAST_3_MONTHS", label: "Last 3 Months" },
    { value: "THIS_YEAR", label: "This Year" },
  ];

  const totalRevenue = report?.revenue.total ?? 0;
  const maxMethodAmount = Math.max(
    ...(report?.revenue.byMethod?.map((m) => m.amount) ?? [1]),
  );

  return (
    <div className="min-h-screen space-y-6 bg-slate-50/30 pb-12 sm:space-y-8">
      {/* ─── Hero Header ─── */}
      {/* ─── Hero Header ─── */}
      <section className="relative overflow-hidden rounded-b-[2.5rem] border-b border-emerald-100/60 bg-white px-4 pb-8 pt-7 shadow-[0_8px_60px_rgba(16,185,129,0.07)] sm:px-8 sm:pb-10 sm:pt-10">
        {/* Soft ambient blobs */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-100/40 blur-[100px]" />
        <div className="pointer-events-none absolute -left-20 top-24 h-56 w-56 rounded-full bg-cyan-100/30 blur-[80px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            {/* Left: Title block */}
            <div className="space-y-3.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-emerald-700 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Revenue & Collections
              </div>
              <div>
                <h1 className="text-[2.5rem] font-black leading-none tracking-tight text-slate-900 sm:text-5xl">
                  Reports
                </h1>
                <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-slate-500">
                  Track actual payments received, revenue trends, outstanding
                  dues, and member collections in real-time.
                </p>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="w-full space-y-4 lg:w-auto lg:min-w-[480px]">
              {/* Preset Pills - Hidden Scrollbar */}
              <div className="relative">
                <div
                  className="flex gap-1.5 overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1.5 backdrop-blur-sm"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  {presetOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => applyPreset(option.value)}
                      className={`shrink-0 select-none rounded-xl px-5 py-2.5 text-[13px] font-bold transition-all duration-200 ${
                        preset === option.value
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                          : "text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => applyPreset("CUSTOM")}
                    className={`shrink-0 select-none rounded-xl px-5 py-2.5 text-[13px] font-bold transition-all duration-200 ${
                      preset === "CUSTOM"
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                        : "text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm"
                    }`}
                  >
                    Custom
                  </button>
                </div>
                {/* Fade edges on mobile to indicate scroll */}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 rounded-r-2xl bg-gradient-to-l from-slate-50/80 to-transparent lg:hidden" />
              </div>

              {/* Date + Refresh Row */}
              {preset === "CUSTOM" ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      From
                    </label>
                    <Input
                      type="date"
                      value={from}
                      max={to}
                      onChange={(e) => setFrom(e.target.value)}
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      To
                    </label>
                    <Input
                      type="date"
                      value={to}
                      min={from}
                      max={dateInput(today)}
                      onChange={(e) => setTo(e.target.value)}
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => void mutate()}
                    disabled={isValidating}
                    className="h-11 rounded-xl border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 transition-all ${isValidating ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between sm:justify-end sm:gap-5">
                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-4 py-2.5">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-600">
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(from))}
                      <span className="mx-2 text-slate-300">—</span>
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(to))}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void mutate()}
                    disabled={isValidating}
                    className="h-10 gap-2 rounded-xl px-4 text-sm font-bold text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-800 active:scale-95"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isValidating ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 sm:space-y-8">
        {/* ─── Error Banner ─── */}
        {error ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100">
              <ArrowDownRight className="h-4 w-4 text-rose-600" />
            </div>
            {error instanceof Error ? error.message : "Unable to load reports"}
          </div>
        ) : null}

        {/* ─── KPI Cards ─── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <StatCard
                label="Total Revenue"
                value={money.format(totalRevenue)}
                icon={IndianRupee}
                accent="emerald"
                trend="up"
                trendValue="Period"
              />
              <StatCard
                label="Payments Received"
                value={report?.revenue.paymentCount ?? 0}
                icon={ReceiptText}
                accent="blue"
                trend="neutral"
                trendValue={`Avg ${money.format(report?.revenue.averagePayment ?? 0)}`}
              />
              <StatCard
                label="Average Payment"
                value={money.format(report?.revenue.averagePayment ?? 0)}
                icon={CreditCard}
                accent="violet"
              />
              <StatCard
                label="Outstanding Dues"
                value={money.format(report?.outstanding ?? 0)}
                icon={TrendingUp}
                accent="amber"
                trend={(report?.outstanding ?? 0) > 0 ? "down" : "up"}
                trendValue="Pending"
              />
            </>
          )}
        </div>

        {/* ─── Revenue Chart + Payment Methods ─── */}
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          {/* Chart */}
          <Card className="overflow-hidden rounded-[1.5rem] border-slate-200/60 p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-800">
                  Revenue Trend
                </h2>
                <p className="mt-0.5 text-xs font-medium text-slate-400">
                  Daily payment collections for the selected period
                </p>
              </div>
              <Badge
                variant="outline"
                className="w-fit rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
              >
                {money.format(totalRevenue)}
              </Badge>
            </div>
            <div className="mt-6 h-[300px] w-full sm:h-[320px]">
              {isLoading ? (
                <SkeletonChart />
              ) : (report?.revenue.series ?? []).length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  message="No revenue data for this period"
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={report?.revenue.series ?? []}
                    margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="4 4"
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDay}
                      tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                      minTickGap={24}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) =>
                        `₹${(v / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "#f8fafc", radius: 6 }}
                    />
                    <Bar
                      dataKey="amount"
                      name="Revenue"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={48}
                    >
                      {(report?.revenue.series ?? []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.amount > 0 ? "#10b981" : "#e2e8f0"}
                          className="transition-all duration-300 hover:opacity-80"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Payment Methods */}
          <Card className="rounded-[1.5rem] border-slate-200/60 p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-800">
                  Payment Methods
                </h2>
                <p className="mt-0.5 text-xs font-medium text-slate-400">
                  Breakdown by collection source
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                <Wallet className="h-5 w-5 text-slate-400" />
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {isLoading ? (
                <SkeletonList />
              ) : (report?.revenue.byMethod ?? []).length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  message="No payment methods recorded"
                />
              ) : (
                report?.revenue.byMethod.map((item) => {
                  const percentage =
                    maxMethodAmount > 0
                      ? (item.amount / maxMethodAmount) * 100
                      : 0;
                  return (
                    <div
                      key={item.method}
                      className="group relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3.5 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                            <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                          </div>
                          <span className="text-sm font-bold text-slate-700">
                            {methodLabel(item.method)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-sm font-black text-slate-900">
                            {money.format(item.amount)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="ml-3 shrink-0 text-[11px] font-bold text-slate-400">
                          {item.count} payment{item.count === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* ─── Recent Payments + Collection Snapshot ─── */}
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          {/* Recent Payments Table */}
          <Card className="overflow-hidden rounded-[1.5rem] border-slate-200/60 p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-800">
                  Recent Payments
                </h2>
                <p className="mt-0.5 text-xs font-medium text-slate-400">
                  Latest collections in the selected period
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                <ReceiptText className="h-5 w-5 text-slate-400" />
              </div>
            </div>

            <div className="mt-5">
              {isLoading ? (
                <SkeletonTable />
              ) : (report?.recentPayments ?? []).length === 0 ? (
                <EmptyState
                  icon={ReceiptText}
                  message="No payments in this period"
                />
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Member
                        </th>
                        <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Method
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {report?.recentPayments.map((payment, idx) => (
                        <tr
                          key={payment.id}
                          className="group transition-colors hover:bg-emerald-50/30"
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
                                <Users className="h-4 w-4" />
                              </div>
                              <span className="truncate text-sm font-bold text-slate-700">
                                {payment.member}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span className="text-sm font-black text-slate-900">
                              {money.format(payment.amount)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge
                              variant="outline"
                              className="rounded-full border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-600"
                            >
                              {methodLabel(payment.method)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-sm font-medium text-slate-500">
                              {formatPaymentDate(payment.paymentDate)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>

          {/* Collection Snapshot */}
          <Card className="rounded-[1.5rem] border-slate-200/60 p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-800">
                  Collection Snapshot
                </h2>
                <p className="text-xs font-medium text-slate-400">
                  Money position overview
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {isLoading ? (
                <SkeletonSnapshot />
              ) : (
                <>
                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30">
                    <div className="relative z-10">
                      <p className="text-xs font-semibold text-emerald-100">
                        Revenue in Selected Period
                      </p>
                      <p className="mt-1 text-3xl font-black tracking-tight">
                        {money.format(totalRevenue)}
                      </p>
                    </div>
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                    <TrendingUp className="absolute bottom-4 right-4 h-16 w-16 text-white/10" />
                  </div>

                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 p-5 text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30">
                    <div className="relative z-10">
                      <p className="text-xs font-semibold text-amber-100">
                        Outstanding Across Memberships
                      </p>
                      <p className="mt-1 text-3xl font-black tracking-tight">
                        {money.format(report?.outstanding ?? 0)}
                      </p>
                    </div>
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                    <ArrowDownRight className="absolute bottom-4 right-4 h-16 w-16 text-white/10" />
                  </div>

                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 p-5 text-white shadow-lg shadow-slate-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/30">
                    <div className="relative z-10">
                      <p className="text-xs font-semibold text-slate-300">
                        Active Memberships
                      </p>
                      <p className="mt-1 text-3xl font-black tracking-tight">
                        {report?.memberships.active ?? 0}
                      </p>
                    </div>
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5 blur-xl" />
                    <Users className="absolute bottom-4 right-4 h-16 w-16 text-white/10" />
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* ─── Member + Membership Snapshots ─── */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Member Snapshot */}
          <Card className="rounded-[1.5rem] border-slate-200/60 p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-800">
                  Member Snapshot
                </h2>
                <p className="text-xs font-medium text-slate-400">
                  Current member base overview
                </p>
              </div>
            </div>

            <div className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-24 animate-pulse rounded-xl bg-slate-100"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      label: "Total",
                      value: report?.members.total ?? 0,
                      accent: "bg-slate-800 text-white",
                    },
                    {
                      label: "New",
                      value: report?.members.newMembers ?? 0,
                      accent: "bg-emerald-500 text-white",
                    },
                    {
                      label: "Active",
                      value: report?.members.active ?? 0,
                      accent: "bg-blue-500 text-white",
                    },
                    {
                      label: "Inactive",
                      value: report?.members.inactive ?? 0,
                      accent: "bg-slate-400 text-white",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div
                        className={`absolute inset-0 rounded-xl ${item.accent} opacity-90`}
                      />
                      <div className="absolute -right-2 -top-2 h-12 w-12 rounded-full bg-white/10 blur-lg" />
                      <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                          {item.label}
                        </p>
                        <p className="mt-1 text-2xl font-black text-white">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Membership Snapshot */}
          <Card className="rounded-[1.5rem] border-slate-200/60 p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-800">
                  Membership Snapshot
                </h2>
                <p className="text-xs font-medium text-slate-400">
                  Current lifecycle position
                </p>
              </div>
            </div>

            <div className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-24 animate-pulse rounded-xl bg-slate-100"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: "Active",
                      value: report?.memberships.active ?? 0,
                      color: "from-emerald-500 to-emerald-600",
                    },
                    {
                      label: "Expiring",
                      value: report?.memberships.expiring ?? 0,
                      color: "from-amber-400 to-amber-500",
                    },
                    {
                      label: "Expired",
                      value: report?.memberships.expired ?? 0,
                      color: "from-rose-400 to-rose-500",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-br p-4 text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div
                        className={`absolute inset-0 rounded-xl bg-gradient-to-br ${item.color} opacity-90`}
                      />
                      <div className="absolute -right-2 -top-2 h-12 w-12 rounded-full bg-white/10 blur-lg" />
                      <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                          {item.label}
                        </p>
                        <p className="mt-1 text-2xl font-black text-white">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && (report?.memberships.byPlan ?? []).length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {(report?.memberships.byPlan ?? [])
                    .slice(0, 6)
                    .map((item) => (
                      <Badge
                        key={item.plan}
                        variant="outline"
                        className="rounded-full border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                      >
                        {item.plan}
                        <span className="ml-1.5 text-[10px] text-slate-400">
                          ·
                        </span>
                        <span className="ml-1.5 text-emerald-600">
                          {item.count}
                        </span>
                      </Badge>
                    ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
