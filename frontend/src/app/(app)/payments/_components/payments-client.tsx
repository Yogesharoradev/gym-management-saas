"use client";

import * as React from "react";
import useSWR from "swr";
import { CalendarDays, ChevronLeft, ChevronRight, Download, IndianRupee, Search } from "lucide-react";
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

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export function PaymentsClient() {
  const [query, setQuery] = React.useState("");
  const [method, setMethod] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [page, setPage] = React.useState(1);

  const key = React.useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "15" });
    if (query.trim()) params.set("q", query.trim());
    if (method) params.set("method", method);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return `/api/payments?${params.toString()}`;
  }, [page, query, method, from, to]);

  const { data, error, isLoading } = useSWR<FeeResponse>(key, async (url) => {
    const response = await fetch(url);
    const result = (await response.json()) as FeeResponse & { error?: string };
    if (!response.ok) throw new Error(result.error ?? "Unable to load fee records");
    return result;
  }, { keepPreviousData: true, revalidateOnFocus: false });

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 15));
  const downloadReceipt = (paymentId: string) => {
    window.location.href = `/api/payments/${paymentId}/receipt`;
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">Finance</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Fee Records</h1>
        <p className="mt-1 text-sm text-slate-500">View every payment received by the gym and download receipts.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5"><p className="text-sm text-slate-500">Records</p><p className="mt-1 text-2xl font-bold">{data?.total ?? 0}</p></Card>
        <Card className="p-5"><p className="text-sm text-slate-500">Current page</p><p className="mt-1 text-2xl font-bold">{page} / {totalPages}</p></Card>
        <Card className="p-5"><p className="text-sm text-slate-500">Quick action</p><Button variant="outline" className="mt-2" onClick={() => { setQuery(""); setMethod(""); setFrom(""); setTo(""); setPage(1); }}><IndianRupee className="mr-2 h-4 w-4" />Clear filters</Button></Card>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" placeholder="Search member or mobile" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} /></div>
          <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" value={method} onChange={(e) => { setMethod(e.target.value); setPage(1); }}>
            <option value="">All payment methods</option><option value="CASH">Cash</option><option value="UPI">UPI</option><option value="CARD">Card</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="OTHER">Other</option>
          </select>
          <div className="relative"><CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} /></div>
          <div className="relative"><CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} /></div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead><tr className="border-b bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><th className="px-5 py-3">Date</th><th className="px-5 py-3">Member</th><th className="px-5 py-3">Plan</th><th className="px-5 py-3">Amount Paid</th><th className="px-5 py-3">Method</th><th className="px-5 py-3">Outstanding</th><th className="px-5 py-3 text-right">Receipt</th></tr></thead>
            <tbody>
              {isLoading && !data ? <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">Loading fee records…</td></tr> : error ? <tr><td colSpan={7} className="px-5 py-12 text-center text-rose-600">{error instanceof Error ? error.message : "Unable to load fee records"}</td></tr> : data?.payments.length ? data.payments.map((payment) => (
                <tr key={payment.id} className="border-b last:border-0 hover:bg-slate-50/70">
                  <td className="px-5 py-4 text-slate-600">{formatDate(payment.paymentDate)}</td>
                  <td className="px-5 py-4"><div className="font-semibold text-slate-900">{payment.memberName}</div><div className="text-xs text-slate-500">{payment.phone || "—"}</div></td>
                  <td className="px-5 py-4 text-slate-600">{payment.planName}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{money.format(payment.amount)}</td>
                  <td className="px-5 py-4"><Badge variant="outline">{payment.method.replaceAll("_", " ")}</Badge></td>
                  <td className="px-5 py-4 font-medium text-slate-700">{money.format(payment.outstanding)}</td>
                  <td className="px-5 py-4 text-right"><Button variant="outline" size="sm" onClick={() => downloadReceipt(payment.id)}><Download className="mr-2 h-4 w-4" />Download</Button></td>
                </tr>
              )) : <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">No fee records found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t px-5 py-3"><p className="text-sm text-slate-500">{data?.total ?? 0} payment records</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="h-4 w-4" /></Button><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}><ChevronRight className="h-4 w-4" /></Button></div></div>
      </Card>
    </div>
  );
}
