"use client";

import * as React from "react";
import useSWR from "swr";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  IndianRupee,
  ReceiptText,
  RefreshCw,
  Search,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface FeeRecord {
  id: string;
  memberName: string;
  phone: string;
  planName: string;
  membershipAmount: number;
  amount: number;
  method: string;
  paymentDate: string;
  transactionReference: string;
  outstanding: number;
}

interface FeeResponse {
  payments: FeeRecord[];
  total: number;
  page: number;
  pageSize: number;
}

const PAGE_SIZE = 15;
const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatDate(value: string): string {
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

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone: "emerald" | "blue" | "violet";
}) {
  const tones = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", glow: "bg-emerald-100" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", glow: "bg-blue-100" },
    violet: { bg: "bg-violet-50", text: "text-violet-600", glow: "bg-violet-100" },
  };
  const colors = tones[tone];

  return (
    <Card className="group relative overflow-hidden rounded-2xl border-slate-200/60 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-md">
      <div className="relative z-10 flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.bg} ${colors.text} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="relative z-10 mt-4">
        <p className="text-2xl font-black tracking-tight text-slate-900">{value}</p>
        <p className="mt-1 text-xs font-semibold text-slate-400">{label}</p>
      </div>
      <div className={`absolute -right-5 -top-5 h-24 w-24 rounded-full ${colors.glow} opacity-40 blur-2xl transition-opacity group-hover:opacity-70`} />
    </Card>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-5">
      <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
      {[1, 2, 3, 4, 5].map((row) => (
        <div key={row} className="grid grid-cols-6 gap-4 py-2">
          {[1, 2, 3, 4, 5, 6].map((cell) => (
            <div key={cell} className="h-9 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PaymentsClient() {
  const [query, setQuery] = React.useState("");
  const [method, setMethod] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [page, setPage] = React.useState(1);

  const key = React.useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (query.trim()) params.set("q", query.trim());
    if (method) params.set("method", method);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return `/api/payments?${params.toString()}`;
  }, [page, query, method, from, to]);

  const { data, error, isLoading, isValidating, mutate } = useSWR<FeeResponse>(
    key,
    async (url) => {
      const response = await fetch(url);
      const result = (await response.json()) as FeeResponse & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to load fee records");
      return result;
    },
    { keepPreviousData: true, revalidateOnFocus: false },
  );

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const totalCollected = data?.payments.reduce((sum, payment) => sum + payment.amount, 0) ?? 0;
  const totalOutstanding = data?.payments.reduce((sum, payment) => sum + payment.outstanding, 0) ?? 0;

  const clearFilters = () => {
    setQuery("");
    setMethod("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const downloadReceipt = (paymentId: string) => {
    window.location.href = `/api/payments/${paymentId}/receipt`;
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50/30 pb-12 sm:space-y-8">
      <section className="relative overflow-hidden rounded-b-[2.5rem] border-b border-emerald-100/60 bg-white px-4 pb-8 pt-7 shadow-[0_8px_60px_rgba(16,185,129,0.07)] sm:px-8 sm:pb-10 sm:pt-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-100/40 blur-[100px]" />
        <div className="pointer-events-none absolute -left-20 top-24 h-56 w-56 rounded-full bg-cyan-100/30 blur-[80px]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-emerald-700">
                <ReceiptText className="h-3.5 w-3.5" />
                Finance & Collections
              </div>
              <div>
                <h1 className="text-[2.5rem] font-black leading-none tracking-tight text-slate-900 sm:text-5xl">Fee History</h1>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-500">
                  View every payment received by your gym, track outstanding dues, and download payment receipts.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => void mutate()}
              disabled={isValidating}
              className="h-11 rounded-xl border-slate-200 bg-white px-5 font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isValidating ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-8 md:grid-cols-3">
        <StatCard icon={ReceiptText} label="Total payment records" value={String(data?.total ?? 0)} tone="emerald" />
        <StatCard icon={Wallet} label="Collected on this page" value={money.format(totalCollected)} tone="blue" />
        <StatCard icon={IndianRupee} label="Outstanding on this page" value={money.format(totalOutstanding)} tone="violet" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <Card className="rounded-2xl border-slate-200/60 p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900">Search & Filters</p>
              <p className="mt-0.5 text-xs text-slate-400">Find payments by member, method, or date.</p>
            </div>
            {(query || method || from || to) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="font-semibold text-slate-500 hover:text-slate-900">
                Clear filters
              </Button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-9 focus:border-emerald-400 focus:ring-emerald-100" placeholder="Search member or mobile" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
            </div>
            <select className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-400" value={method} onChange={(event) => { setMethod(event.target.value); setPage(1); }}>
              <option value="">All payment methods</option>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="OTHER">Other</option>
            </select>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-9 focus:border-emerald-400 focus:ring-emerald-100" type="date" value={from} max={to || undefined} onChange={(event) => { setFrom(event.target.value); setPage(1); }} />
            </div>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-9 focus:border-emerald-400 focus:ring-emerald-100" type="date" value={to} min={from || undefined} onChange={(event) => { setTo(event.target.value); setPage(1); }} />
            </div>
          </div>
        </Card>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <Card className="overflow-hidden rounded-2xl border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Payment Records</h2>
              <p className="mt-0.5 text-xs text-slate-400">{data?.total ?? 0} records found</p>
            </div>
            {isValidating && data && <RefreshCw className="h-4 w-4 animate-spin text-emerald-500" />}
          </div>

          {isLoading && !data ? (
            <TableSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                <ReceiptText className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-800">Unable to load fee records</p>
              <p className="mt-1 text-sm text-slate-500">{error instanceof Error ? error.message : "Something went wrong."}</p>
              <Button variant="outline" className="mt-4 rounded-xl" onClick={() => void mutate()}>Try again</Button>
            </div>
          ) : data?.payments.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Member</th>
                    <th className="px-5 py-3.5">Plan</th>
                    <th className="px-5 py-3.5">Amount Paid</th>
                    <th className="px-5 py-3.5">Method</th>
                    <th className="px-5 py-3.5">Outstanding</th>
                    <th className="px-5 py-3.5 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-slate-100 last:border-0 transition-colors hover:bg-emerald-50/20">
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-500">{formatDate(payment.paymentDate)}</td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{payment.memberName}</div>
                        <div className="mt-0.5 text-xs text-slate-400">{payment.phone || "No mobile"}</div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-600">{payment.planName}</td>
                      <td className="px-5 py-4">
                        <span className="font-black text-slate-900">{money.format(payment.amount)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge className="rounded-full border-0 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100">
                          {methodLabel(payment.method)}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-600">{money.format(payment.outstanding)}</td>
                      <td className="px-5 py-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => downloadReceipt(payment.id)} className="rounded-xl border-slate-200 font-semibold text-slate-700 shadow-sm hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                          <Download className="mr-2 h-4 w-4" />
                          Receipt
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                <ReceiptText className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-bold text-slate-800">No fee records found</p>
              <p className="mt-1 max-w-sm text-sm text-slate-400">Payments will appear here automatically once a membership payment is recorded.</p>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs font-medium text-slate-400">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-xl border-slate-200">
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Previous</span>
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-xl border-slate-200">
                <span className="mr-1 hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
