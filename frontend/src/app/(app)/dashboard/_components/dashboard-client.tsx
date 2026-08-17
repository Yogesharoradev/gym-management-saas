"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  Clock3,
  Info,
  RefreshCw,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import useSWR from "swr";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DashboardData } from "@/lib/data/dashboard";

interface DashboardResponse {
  dashboard: DashboardData;
  user: { name: string };
  gym: { name: string; subscriptionEndDate?: string | null };
  access: { inGracePeriod: boolean; graceDaysRemaining: number };
  error?: string;
}

const fetcher = async (url: string): Promise<DashboardResponse> => {
  const response = await fetch(url);
  const data = (await response.json()) as DashboardResponse;
  if (!response.ok) throw new Error(data.error ?? "Unable to load dashboard");
  return data;
};

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

const actionLinkClass =
  "inline-flex w-full shrink-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/40 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40";

export default function DashboardClient() {
  const { data, error, isLoading, mutate } = useSWR<DashboardResponse>(
    "/api/dashboard",
    fetcher,
    { keepPreviousData: true },
  );

  if (isLoading && !data) {
    return (
      <div className="space-y-6 sm:space-y-7" aria-busy="true">
        <div className="h-48 animate-pulse rounded-[24px] bg-slate-100" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
          <div className="h-80 animate-pulse rounded-[22px] bg-slate-100" />
          <div className="h-80 animate-pulse rounded-[22px] bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm text-rose-700">
        <div>
          <p className="font-semibold">{error instanceof Error ? error.message : "Unable to load dashboard"}</p>
          <button
            type="button"
            onClick={() => void mutate()}
            className="mt-3 inline-flex items-center gap-2 font-semibold underline"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { dashboard, user, gym, access } = data;
  const firstName = user.name.split(" ")[0] || "there";
  const attentionTotal = dashboard.expiredMembers + dashboard.expiringSoon;

  const stats = [
    { key: "total-members", label: "Total Members", value: dashboard.totalMembers.toLocaleString("en-IN"), helper: "All registered", icon: Users },
    { key: "active-members", label: "Active Members", value: dashboard.activeMembers.toLocaleString("en-IN"), helper: "Member status is active", icon: UserCheck, accent: true },
    { key: "inactive-members", label: "Inactive Members", value: dashboard.inactiveMembers.toLocaleString("en-IN"), helper: "Member status is inactive", icon: UserX, tone: "rose" as const },
    { key: "expiring-soon", label: "Expiring Soon", value: dashboard.expiringSoon.toLocaleString("en-IN"), helper: "Memberships in next 7 days", icon: Clock3, tone: "amber" as const },
    { key: "expired-members", label: "Expired", value: dashboard.expiredMembers.toLocaleString("en-IN"), helper: "Memberships already ended", icon: UserX, tone: "orange" as const },
  ];

  return (
    <div className="space-y-6 sm:space-y-7">
      <section className="relative overflow-hidden rounded-[24px] border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/70 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              <span>Welcome back</span><span className="h-1 w-1 rounded-full bg-emerald-400" /><span className="text-slate-500">{gym.name}</span>
            </div>
            <h1 className="mt-2 font-heading text-3xl font-black tracking-[-0.04em] text-slate-900 sm:text-4xl">{firstName} <span aria-hidden="true">👋</span></h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">Your daily gym overview, with the members who need attention first.</p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge className="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"><span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />Live data</Badge>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-500">Updated just now</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><CalendarCheck className="h-5 w-5" /></div>
            <div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Today</p><p className="mt-0.5 text-sm font-bold text-slate-800">{formatDate(new Date().toISOString())}</p></div>
          </div>
        </div>
      </section>

      {access.inGracePeriod ? (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 shadow-sm sm:p-5">
          <div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><AlertTriangle className="h-4 w-4" /></div><div><p className="text-sm font-bold text-amber-950">Your Fitaah subscription has expired</p><p className="mt-1 text-sm leading-6 text-amber-800/80">Your subscription ended on {gym.subscriptionEndDate ? formatDate(gym.subscriptionEndDate) : "the expiry date"}. You are in the {access.graceDaysRemaining}-day grace period. Please contact the administrator before access is paused.</p></div></div>
        </div>
      ) : null}

      <section>
        <div className="mb-3 flex items-end justify-between gap-3 px-0.5"><div><h2 className="text-base font-bold tracking-tight text-slate-900">Needs attention</h2><p className="mt-0.5 text-xs text-slate-400">Membership actions based on today&apos;s date</p></div><Link href="/expiry" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">Open expiry workspace <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/expiry" className="group rounded-2xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/60 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><AlertTriangle className="h-5 w-5" /></span><span className="text-3xl font-black text-slate-900">{dashboard.expiredMembers}</span></div><p className="mt-4 font-bold text-slate-800">Expired memberships</p><p className="mt-1 text-xs leading-5 text-slate-500">Members whose membership end date has already passed.</p><span className="mt-3 inline-flex items-center text-xs font-bold text-rose-600">Review and renew <ArrowRight className="ml-1 h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span></Link>
          <Link href="/expiry" className="group rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/60 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Clock3 className="h-5 w-5" /></span><span className="text-3xl font-black text-slate-900">{dashboard.expiringSoon}</span></div><p className="mt-4 font-bold text-slate-800">Expiring in 7 days</p><p className="mt-1 text-xs leading-5 text-slate-500">Members approaching their membership end date.</p><span className="mt-3 inline-flex items-center text-xs font-bold text-amber-700">Plan renewals <ArrowRight className="ml-1 h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span></Link>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">{attentionTotal === 0 ? "No membership actions are due right now." : `${attentionTotal} membership${attentionTotal === 1 ? "" : "s"} need attention.`}</p>
      </section>

      <section><div className="mb-3 px-0.5"><h2 className="text-base font-bold tracking-tight text-slate-900">Gym overview</h2><p className="mt-0.5 text-xs text-slate-400">Live member metrics</p></div><div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">{stats.map((stat) => <StatCard key={stat.key} testId={`stat-${stat.key}`} label={stat.label} value={stat.value} helper={stat.helper} icon={stat.icon} accent={stat.accent} tone={stat.tone} />)}</div></section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
        <Card className="rounded-[22px] border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]"><CardHeader className="flex flex-row items-start justify-between space-y-0 px-5 sm:px-6"><div><CardTitle className="text-base font-bold text-slate-900">Expiring memberships</CardTitle><p className="mt-1 text-xs text-slate-400">The next 7 days, ordered by urgency</p></div><Clock3 className="mt-1 h-4 w-4 text-amber-500" /></CardHeader><CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">{dashboard.expiringMembers.length > 0 ? <div className="space-y-2">{dashboard.expiringMembers.map((member) => <div key={member.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{member.name}</p><p className="truncate text-xs text-slate-400">{member.plan}</p></div><div className="flex shrink-0 items-center gap-2"><span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">{member.endsIn}</span><Link href="/expiry" className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-emerald-600" aria-label={`Open renewal workspace for ${member.name}`}><ArrowRight className="h-4 w-4" /></Link></div></div>)}<Link href="/expiry" className={`${actionLinkClass} mt-2 h-10`}>View all expiry actions<ArrowRight className="h-4 w-4 text-slate-400" /></Link></div> : <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 text-center"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-500"><Info className="h-5 w-5" /></div><p className="mt-3 text-sm font-semibold text-slate-700">No memberships expiring soon</p><p className="mt-1 text-xs text-slate-400">You&apos;re all caught up for the next 7 days.</p></div>}</CardContent></Card>
        <Card className="rounded-[22px] border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]"><CardHeader><CardTitle className="text-base font-bold text-slate-900">Quick actions</CardTitle><p className="mt-1 text-xs text-slate-400">Common tasks for the gym desk</p></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1"><Link href="/members/new" className={`${actionLinkClass} h-11`}><span className="flex items-center gap-2"><Users className="h-4 w-4 text-emerald-600" />Add member</span><ArrowRight className="h-4 w-4 text-slate-400" /></Link><Link href="/memberships" className={`${actionLinkClass} h-11`}><span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-emerald-600" />Assign membership</span><ArrowRight className="h-4 w-4 text-slate-400" /></Link><Link href="/expiry" className={`${actionLinkClass} h-11`}><span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-amber-600" />Review expiry</span><ArrowRight className="h-4 w-4 text-slate-400" /></Link></CardContent></Card>
      </div>
    </div>
  );
}
