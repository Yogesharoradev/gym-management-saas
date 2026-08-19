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
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Report {
  range: { from: string; to: string };
  members: { total: number; newMembers: number; active: number; inactive: number; frozen: number };
  memberships: { active: number; expired: number; expiring: number; byPlan: Array<{ plan: string; count: number }> };
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

export function ReportsClient() {
  const today = React.useMemo(() => new Date(), []);
  const defaultFrom = React.useMemo(() => {
    const value = new Date(today);
    value.setDate(value.getDate() - 29);
    return dateInput(value);
  }, [today]);
  const defaultTo = React.useMemo(() => dateInput(today), [today]);
  const [from, setFrom] = React.useState(defaultFrom);
  const [to, setTo] = React.useState(defaultTo);

  const key = `/api/reports?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<ResponseData>(key, fetcher, {
    keepPreviousData: true,
  });
  const report = data?.report;

  const cards = [
    { label: "Revenue", value: money.format(report?.revenue.total ?? 0), icon: IndianRupee },
    { label: "Payments received", value: report?.revenue.paymentCount ?? 0, icon: ReceiptText },
    { label: "Average payment", value: money.format(report?.revenue.averagePayment ?? 0), icon: CreditCard },
    { label: "Outstanding", value: money.format(report?.outstanding ?? 0), icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 sm:space-y-7">
      <section className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-cyan-50/70 p-5 shadow-[0_18px_50px_rgba(16,185,129,0.08)] sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" /> Revenue & collections
            </div>
            <h1 className="font-heading text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Reports</h1>
            <p className="mt-2 text-sm text-slate-500">Track actual payments received, revenue, outstanding dues and collections.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-500">From</label>
              <Input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="h-10 rounded-xl bg-white" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-500">To</label>
              <Input type="date" value={to} min={from} max={dateInput(today)} onChange={(event) => setTo(event.target.value)} className="h-10 rounded-xl bg-white" />
            </div>
            <Button variant="outline" onClick={() => void mutate()} disabled={isValidating} className="h-10 rounded-xl bg-white">
              <RefreshCw className={`mr-2 h-4 w-4 ${isValidating ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error instanceof Error ? error.message : "Unable to load reports"}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="rounded-2xl border-slate-200/80 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Icon className="h-4 w-4" />
              </span>
              {isLoading ? <span className="h-7 w-20 animate-pulse rounded bg-slate-100" /> : <span className="text-xl font-black text-slate-900">{value}</span>}
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-500">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.65fr_1fr]">
        <Card className="rounded-[1.5rem] border-slate-200/80 p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-800">Revenue trend</h2>
              <p className="text-xs text-slate-400">Actual payment collections for the selected period</p>
            </div>
            <Badge variant="outline" className="rounded-full">{money.format(report?.revenue.total ?? 0)}</Badge>
          </div>
          <div className="mt-6 h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report?.revenue.series ?? []}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatDay} tick={{ fontSize: 11 }} minTickGap={18} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => money.format(Number(value))} labelFormatter={(value) => formatDay(String(value))} />
                <Bar dataKey="amount" name="Revenue" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-[1.5rem] border-slate-200/80 p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-800">Payment methods</h2>
              <p className="text-xs text-slate-400">Where collections came from</p>
            </div>
            <CreditCard className="h-5 w-5 text-slate-300" />
          </div>
          <div className="mt-5 space-y-3">
            {(report?.revenue.byMethod ?? []).length ? (
              report?.revenue.byMethod.map((item) => (
                <div key={item.method} className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-600">{methodLabel(item.method)}</span>
                    <span className="text-sm font-black text-slate-900">{money.format(item.amount)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">{item.count} payment{item.count === 1 ? "" : "s"}</p>
                </div>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">No payments in this period.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="rounded-[1.5rem] border-slate-200/80 p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-800">Recent payments</h2>
              <p className="text-xs text-slate-400">Latest collections in the selected period</p>
            </div>
            <ReceiptText className="h-5 w-5 text-slate-300" />
          </div>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[620px]">
              <div className="grid grid-cols-[1.4fr_100px_100px_120px] gap-3 border-b border-slate-100 px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Member</span><span>Amount</span><span>Method</span><span>Date</span>
              </div>
              {(report?.recentPayments ?? []).length ? (
                report?.recentPayments.map((payment) => (
                  <div key={payment.id} className="grid grid-cols-[1.4fr_100px_100px_120px] gap-3 border-b border-slate-100 px-2 py-3 text-sm last:border-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Users className="h-3.5 w-3.5" /></span>
                      <span className="truncate font-semibold text-slate-700">{payment.member}</span>
                    </div>
                    <span className="font-bold text-slate-900">{money.format(payment.amount)}</span>
                    <span className="text-slate-500">{methodLabel(payment.method)}</span>
                    <span className="text-slate-500">{formatPaymentDate(payment.paymentDate)}</span>
                  </div>
                ))
              ) : (
                <p className="px-2 py-8 text-center text-sm text-slate-400">No payments in this period.</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="rounded-[1.5rem] border-slate-200/80 p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600"><IndianRupee className="h-4 w-4" /></span>
            <div><h2 className="font-heading text-lg font-bold text-slate-800">Collection snapshot</h2><p className="text-xs text-slate-400">Money position across memberships</p></div>
          </div>
          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-emerald-50 px-4 py-4"><p className="text-xs text-emerald-700">Revenue in selected period</p><p className="mt-1 text-2xl font-black text-emerald-900">{money.format(report?.revenue.total ?? 0)}</p></div>
            <div className="rounded-xl bg-amber-50 px-4 py-4"><p className="text-xs text-amber-700">Outstanding across memberships</p><p className="mt-1 text-2xl font-black text-amber-900">{money.format(report?.outstanding ?? 0)}</p></div>
            <div className="rounded-xl bg-slate-50 px-4 py-4"><p className="text-xs text-slate-500">Active memberships</p><p className="mt-1 text-2xl font-black text-slate-900">{report?.memberships.active ?? 0}</p></div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-[1.5rem] border-slate-200/80 p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Users className="h-4 w-4" /></span><div><h2 className="font-heading text-lg font-bold text-slate-800">Member snapshot</h2><p className="text-xs text-slate-400">Current member base</p></div></div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[['Total', report?.members.total ?? 0], ['New', report?.members.newMembers ?? 0], ['Active', report?.members.active ?? 0], ['Inactive', report?.members.inactive ?? 0]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-2xl font-black text-slate-800">{value}</p></div>)}
          </div>
        </Card>
        <Card className="rounded-[1.5rem] border-slate-200/80 p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><CalendarDays className="h-4 w-4" /></span><div><h2 className="font-heading text-lg font-bold text-slate-800">Membership snapshot</h2><p className="text-xs text-slate-400">Current lifecycle position</p></div></div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[['Active', report?.memberships.active ?? 0], ['Expiring', report?.memberships.expiring ?? 0], ['Expired', report?.memberships.expired ?? 0]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-2xl font-black text-slate-800">{value}</p></div>)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">{(report?.memberships.byPlan ?? []).slice(0, 5).map((item) => <Badge key={item.plan} variant="outline" className="rounded-full">{item.plan} · {item.count}</Badge>)}</div>
        </Card>
      </div>
    </div>
  );
}
