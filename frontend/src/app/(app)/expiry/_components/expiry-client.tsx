"use client";

import * as React from "react";
import useSWR from "swr";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  IndianRupee,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  ExpiryBucket,
  ExpiryMembership,
  ExpirySummary,
} from "@/lib/data/membership-expiry";

interface Plan {
  id: string;
  name: string;
  duration: number;
  durationUnit: string;
  price: number;
  isActive: boolean;
}
interface ExpiryResponse {
  memberships: ExpiryMembership[];
  summary: ExpirySummary;
  error?: string;
}

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const todayInput = (): string => new Date().toISOString().slice(0, 10);
function dateOnly(value: string): string {
  return value.slice(0, 10);
}
function addDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
function addDuration(start: string, duration: number, unit: string): string {
  const date = new Date(`${start}T00:00:00`);
  if (unit === "DAY") date.setDate(date.getDate() + duration);
  else if (unit === "YEAR") date.setFullYear(date.getFullYear() + duration);
  else date.setMonth(date.getMonth() + duration);
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}
function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
function bucketLabel(bucket: ExpiryBucket): string {
  return bucket === "EXPIRED"
    ? "Expired"
    : bucket === "TODAY"
      ? "Today"
      : bucket === "THREE_DAYS"
        ? "Next 3 days"
        : bucket === "SEVEN_DAYS"
          ? "Next 7 days"
          : "Next 30 days";
}

export function ExpiryClient() {
  const [bucket, setBucket] = React.useState<ExpiryBucket>("SEVEN_DAYS");
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [renewing, setRenewing] = React.useState<ExpiryMembership | null>(null);
  const [form, setForm] = React.useState({
    planId: "",
    startDate: todayInput(),
    endDate: todayInput(),
    amount: "",
    weightAtStart: "",
  });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [query]);

  const expiryKey = React.useMemo(() => {
    const params = new URLSearchParams({ bucket });
    if (debouncedQuery) params.set("q", debouncedQuery);
    return `/api/memberships/expiry?${params.toString()}`;
  }, [bucket, debouncedQuery]);

  const {
    data: expiryData,
    error: expiryError,
    isLoading: expiryLoading,
    isValidating: expiryValidating,
    mutate: mutateExpiry,
  } = useSWR<ExpiryResponse>(expiryKey, {
    keepPreviousData: true,
  });

  const { data: plansData, error: plansError } = useSWR<{
    plans?: Plan[];
    error?: string;
  }>("/api/membership-plans", {
    revalidateOnMount: false,
  });

  const memberships = expiryData?.memberships ?? [];
  const summary = expiryData?.summary ?? {
    expired: 0,
    today: 0,
    threeDays: 0,
    sevenDays: 0,
    thirtyDays: 0,
  };
  const plans = plansData?.plans ?? [];
  const loading = expiryLoading && !expiryData;
  const error =
    expiryError instanceof Error
      ? expiryError.message
      : plansError instanceof Error
        ? plansError.message
        : (expiryData?.error ?? plansData?.error ?? null);

  function openRenew(membership: ExpiryMembership): void {
    const start =
      membership.daysLeft >= 0
        ? addDays(dateOnly(membership.endDate), 1)
        : todayInput();
    const activePlan =
      plans.find((plan) => plan.isActive && plan.id === membership.plan.id) ??
      plans.find((plan) => plan.isActive);
    const plan = activePlan ?? membership.plan;
    setRenewing(membership);
    setForm({
      planId: plan.id,
      startDate: start,
      endDate: addDuration(start, plan.duration, plan.durationUnit),
      amount: String(plan.price),
      weightAtStart: "",
    });
  }

  function changePlan(planId: string): void {
    const plan = plans.find((item) => item.id === planId);
    setForm((current) => ({
      ...current,
      planId,
      amount: plan ? String(plan.price) : current.amount,
      endDate: plan
        ? addDuration(current.startDate, plan.duration, plan.durationUnit)
        : current.endDate,
    }));
  }
  function changeStartDate(startDate: string): void {
    const plan = plans.find((item) => item.id === form.planId);
    setForm((current) => ({
      ...current,
      startDate,
      endDate: plan
        ? addDuration(startDate, plan.duration, plan.durationUnit)
        : current.endDate,
    }));
  }

  async function renewMembership(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (!renewing) return;
    setSaving(true);

    try {
      const response = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: renewing.member.id,
          planId: form.planId,
          startDate: form.startDate,
          endDate: form.endDate,
          amount: Number(form.amount),
          weightAtStart: form.weightAtStart ? Number(form.weightAtStart) : null,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(data.error ?? "Unable to renew membership");
      setRenewing(null);
      await mutateExpiry();
    } catch (err) {
      console.log(err, "errror");
    } finally {
      setSaving(false);
    }
  }

  const cards = [
    {
      key: "EXPIRED" as const,
      label: "Expired",
      value: summary.expired,
      tone: "rose",
      icon: AlertCircle,
    },
    {
      key: "TODAY" as const,
      label: "Today",
      value: summary.today,
      tone: "orange",
      icon: Clock3,
    },
    {
      key: "THREE_DAYS" as const,
      label: "Next 3 days",
      value: summary.threeDays,
      tone: "amber",
      icon: Clock3,
    },
    {
      key: "SEVEN_DAYS" as const,
      label: "Next 7 days",
      value: summary.sevenDays,
      tone: "emerald",
      icon: CalendarDays,
    },
    {
      key: "THIRTY_DAYS" as const,
      label: "Next 30 days",
      value: summary.thirtyDays,
      tone: "blue",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-7">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-cyan-50/70 p-5 shadow-[0_18px_50px_rgba(16,185,129,0.08)] sm:p-7 lg:p-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              <RefreshCw className="h-3.5 w-3.5" />
              Renewal workspace
            </div>
            <h1 className="font-heading text-3xl font-black tracking-[-0.035em] text-slate-900 sm:text-4xl">
              Stay ahead of membership expiry.
            </h1>
            <p className="mt-2.5 max-w-xl text-sm leading-6 text-slate-500">
              See who needs attention today, renew in a few clicks, and keep
              every membership lifecycle visible.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full rounded-xl border-emerald-200 bg-white/80 sm:w-auto"
          >
            <a href="/memberships">
              Manage memberships <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          const active = bucket === card.key;
          const tone =
            card.tone === "rose"
              ? "bg-rose-50 text-rose-600"
              : card.tone === "orange"
                ? "bg-orange-50 text-orange-600"
                : card.tone === "amber"
                  ? "bg-amber-50 text-amber-600"
                  : card.tone === "blue"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-emerald-50 text-emerald-600";
          return (
            <button
              type="button"
              key={card.key}
              onClick={() => setBucket(card.key)}
              className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${active ? "border-emerald-300 ring-2 ring-emerald-500/10" : "border-slate-200/80"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {loading ? "—" : card.value}
                </span>
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-500">
                {card.label}
              </p>
            </button>
          );
        })}
      </div>
      <Card className="overflow-hidden rounded-[1.5rem] border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search member name or phone..."
              className="h-11 rounded-xl border-slate-200 bg-slate-50/70 pl-10"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="hidden sm:inline">Showing</span>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-slate-600">
              {bucketLabel(bucket)}
            </span>
          </div>
        </div>
        {error ? (
          <div className="m-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : memberships.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-800">
              You&apos;re all caught up
            </h2>
            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
              There are no memberships in this expiry window.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[920px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      Member
                    </th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      Plan
                    </th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      Expires
                    </th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      Start weight
                    </th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {memberships.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-emerald-50/25"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {item.member.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.member.phone}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-700">
                          {item.plan.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {money.format(item.amount)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-700">
                          {formatDate(item.endDate)}
                        </p>
                        <p
                          className={`text-xs font-semibold ${item.daysLeft < 0 ? "text-rose-600" : item.daysLeft <= 3 ? "text-orange-600" : "text-emerald-600"}`}
                        >
                          {item.daysLeft < 0
                            ? `${Math.abs(item.daysLeft)} days ago`
                            : item.daysLeft === 0
                              ? "Expires today"
                              : `${item.daysLeft} days left`}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {item.weightAtStart === null
                          ? "Not added"
                          : `${item.weightAtStart} kg`}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant="outline"
                          className={`rounded-full ${item.daysLeft < 0 ? "border-rose-200 bg-rose-50 text-rose-700" : item.daysLeft <= 3 ? "border-orange-200 bg-orange-50 text-orange-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
                        >
                          {item.daysLeft < 0 ? "EXPIRED" : "EXPIRING"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          onClick={() => openRenew(item)}
                          className="h-9 rounded-lg bg-emerald-600 px-3 text-xs font-semibold hover:bg-emerald-700"
                        >
                          Renew
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-slate-100 md:hidden">
              {memberships.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-cyan-100 text-xs font-black text-emerald-700">
                      {item.member.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {item.member.name}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {item.member.phone}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`rounded-full text-[10px] ${item.daysLeft < 0 ? "border-rose-200 bg-rose-50 text-rose-700" : "border-orange-200 bg-orange-50 text-orange-700"}`}
                        >
                          {item.daysLeft < 0 ? "EXPIRED" : `${item.daysLeft}d`}
                        </Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Plan
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {item.plan.name}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Expires
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {formatDate(item.endDate)}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => openRenew(item)}
                        className="mt-3 h-10 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700"
                      >
                        Renew membership
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
      {renewing ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 sm:p-5">
          <Card className="flex h-[min(680px,calc(100vh-1.5rem))] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                  Membership renewal
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Renew {renewing.member.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create the next membership period without losing the previous
                  history.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRenewing(null)}
                className="h-9 w-9 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="mx-auto h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={(event) => void renewMembership(event)}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              <div className="space-y-5 p-5 sm:p-6">
                <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    Current membership
                  </p>
                  <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-slate-800">
                      {renewing.plan.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Ended {formatDate(renewing.endDate)}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-800">
                    New membership plan
                  </label>
                  <select
                    required
                    value={form.planId}
                    onChange={(event) => changePlan(event.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                  >
                    {plans
                      .filter((plan) => plan.isActive)
                      .map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} · {money.format(plan.price)}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold">Start date</label>
                    <Input
                      required
                      type="date"
                      value={form.startDate}
                      onChange={(event) => changeStartDate(event.target.value)}
                      className="mt-2 h-11 rounded-lg border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">End date</label>
                    <Input
                      required
                      type="date"
                      value={form.endDate}
                      onChange={(event) =>
                        setForm({ ...form, endDate: event.target.value })
                      }
                      className="mt-2 h-11 rounded-lg border-slate-200"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold">Amount</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        required
                        type="number"
                        min="0"
                        value={form.amount}
                        onChange={(event) =>
                          setForm({ ...form, amount: event.target.value })
                        }
                        className="mt-2 h-11 rounded-lg border-slate-200 pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold">
                      Starting weight{" "}
                      <span className="font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.weightAtStart}
                      onChange={(event) =>
                        setForm({ ...form, weightAtStart: event.target.value })
                      }
                      placeholder="e.g. 72.5"
                      className="mt-2 h-11 rounded-lg border-slate-200"
                    />
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      New period: {formatDate(form.startDate)} →{" "}
                      {formatDate(form.endDate)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      The end date is suggested from the selected plan. You can
                      adjust it before saving.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRenewing(null)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={saving || !plans.some((plan) => plan.isActive)}
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {saving ? "Renewing…" : "Renew membership"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
