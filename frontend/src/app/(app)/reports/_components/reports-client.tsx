"use client";

import * as React from "react";
import useSWR from "swr";
import { Activity, CalendarDays, IndianRupee, Users, CreditCard, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Report {
  range: { from: string; to: string };
  members: { total: number; newMembers: number; active: number; inactive: number; frozen: number };
  memberships: { active: number; expired: number; expiring: number; byPlan: Array<{ plan: string; count: number }> };
  revenue: { total: number; averagePayment: number; byMethod: Array<{ method: string; amount: number }>; series: Array<{ date: string; amount: number }> };
  attendance: { checkIns: number; uniqueMembers: number; series: Array<{ date: string; count: number }> };
}

interface ResponseData { report?: Report; error?: string }

const fetcher = async (url: string): Promise<ResponseData> => {
  const response = await fetch(url);
  const data = (await response.json()) as ResponseData;
  if (!response.ok) throw new Error(data.error ?? "Unable to load reports");
  return data;
};

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function dateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDay(value: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(`${value}T00:00:00`));
}

export function ReportsClient() {
  const today = React.useMemo(() => new Date(), []);
  const defaultFrom = React.useMemo(() => { const value = new Date(today); value.setDate(value.getDate() - 29); return dateInput(value); }, [today]);
  const defaultTo = React.useMemo(() => dateInput(today), [today]);
  const [from, setFrom] = React.useState(defaultFrom);
  const [to, setTo] = React.useState(defaultTo);

  const key = `/api/reports?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<ResponseData>(key, fetcher, { keepPreviousData: true });
  const report = data?.report;

  const cards = [
    { label: "Total members", value: report?.members.total ?? 0, icon: Users },
    { label: "New members", value: report?.members.newMembers ?? 0, icon: TrendingUp },
    { label: "Active memberships", value: report?.memberships.active ?? 0, icon: CreditCard },
    { label: "Revenue", value: money.format(report?.revenue.total ?? 0), icon: IndianRupee },
    { label: "Check-ins", value: report?.attendance.checkIns ?? 0, icon: Activity },
  ];

  return (
    <div className="space-y-6 sm:space-y-7">
      <section className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-cyan-50/70 p-5 shadow-[0_18px_50px_rgba(16,185,129,0.08)] sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" /> Business overview
            </div>
            <h1 className="font-heading text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Reports</h1>
            <p className="mt-2 text-sm text-slate-500">Understand member growth, memberships, revenue and attendance.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div><label className="mb-1 block text-[11px] font-semibold text-slate-500">From</label><Input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="h-10 rounded-xl bg-white" /></div>
            <div><label className="mb-1 block text-[11px] font-semibold text-slate-500">To</label><Input type="date" value={to} min={from} max={dateInput(today)} onChange={(event) => setTo(event.target.value)} className="h-10 rounded-xl bg-white" /></div>
            <Button variant="outline" onClick={() => void mutate()} disabled={isValidating} className="h-10 rounded-xl bg-white">Refresh</Button>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error instanceof Error ? error.message : "Unable to load reports"}</div> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="rounded-2xl border-slate-200/80 p-4 shadow-sm">
            <div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Icon className="h-4 w-4" /></span>{isLoading ? <span className="h-7 w-16 animate-pulse rounded bg-slate-100" /> : <span className="text-xl font-black text-slate-900">{value}</span>}</div>
            <p className="mt-3 text-xs font-semibold text-slate-500">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card className="rounded-[1.5rem] border-slate-200/80 p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between"><div><h2 className="font-heading text-lg font-bold text-slate-800">Revenue trend</h2><p className="text-xs text-slate-400">Daily collection for the selected period</p></div><Badge variant="outline" className="rounded-full">{money.format(report?.revenue.total ?? 0)}</Badge></div>
          <div className="mt-6 h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%"><BarChart data={report?.revenue.series ?? []}><CartesianGrid vertical={false} /><XAxis dataKey="date" tickFormatter={formatDay} tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => money.format(Number(value))} labelFormatter={(value) => formatDay(String(value))} /><Bar dataKey="amount" name="Revenue" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-[1.5rem] border-slate-200/80 p-5 shadow-sm sm:p-6">
          <h2 className="font-heading text-lg font-bold text-slate-800">Membership snapshot</h2>
          <p className="text-xs text-slate-400">Current lifecycle position</p>
          <div className="mt-5 space-y-3">
            {[['Active', report?.memberships.active ?? 0], ['Expiring soon', report?.memberships.expiring ?? 0], ['Expired', report?.memberships.expired ?? 0]].map(([label, value]) => <div key={String(label)} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span className="text-sm font-semibold text-slate-600">{label}</span><span className="text-lg font-black text-slate-900">{value}</span></div>)}
          </div>
          <div className="mt-5 border-t border-slate-100 pt-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Top plans</p><div className="mt-3 space-y-2">{(report?.memberships.byPlan ?? []).slice(0, 5).map((item) => <div key={item.plan} className="flex justify-between gap-3 text-sm"><span className="truncate text-slate-600">{item.plan}</span><span className="font-bold text-slate-800">{item.count}</span></div>)}</div></div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-[1.5rem] border-slate-200/80 p-5 shadow-sm sm:p-6">
          <h2 className="font-heading text-lg font-bold text-slate-800">Member health</h2>
          <p className="text-xs text-slate-400">Current member status distribution</p>
          <div className="mt-5 grid grid-cols-3 gap-3"><div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs text-emerald-700">Active</p><p className="mt-1 text-2xl font-black text-emerald-800">{report?.members.active ?? 0}</p></div><div className="rounded-xl bg-amber-50 p-4"><p className="text-xs text-amber-700">Frozen</p><p className="mt-1 text-2xl font-black text-amber-800">{report?.members.frozen ?? 0}</p></div><div className="rounded-xl bg-slate-100 p-4"><p className="text-xs text-slate-500">Inactive</p><p className="mt-1 text-2xl font-black text-slate-800">{report?.members.inactive ?? 0}</p></div></div>
          <div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Average payment</p><p className="mt-1 text-2xl font-black text-slate-900">{money.format(report?.revenue.averagePayment ?? 0)}</p></div>
        </Card>
        <Card className="rounded-[1.5rem] border-slate-200/80 p-5 shadow-sm sm:p-6">
          <h2 className="font-heading text-lg font-bold text-slate-800">Attendance trend</h2>
          <p className="text-xs text-slate-400">Daily check-ins in the selected period</p>
          <div className="mt-5 space-y-2">{(report?.attendance.series ?? []).slice(-7).map((item) => <div key={item.date} className="flex items-center gap-3"><span className="w-16 text-xs text-slate-400">{formatDay(item.date)}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, item.count * 10)}%` }} /></div><span className="w-8 text-right text-xs font-bold text-slate-700">{item.count}</span></div>)}</div>
          <div className="mt-5 rounded-xl bg-cyan-50 p-4"><p className="text-xs text-cyan-700">Unique members checked in</p><p className="mt-1 text-2xl font-black text-cyan-900">{report?.attendance.uniqueMembers ?? 0}</p></div>
        </Card>
      </div>
    </div>
  );
}
