import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, Edit3, History, Mail, MapPin, Phone, ShieldAlert, Sparkles, UserRound, Weight } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireGymContext } from "@/lib/auth/guards";
import { getMemberProfileData } from "@/lib/data/members";
import type { MemberStatus, MembershipStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";
type PageProps = { params: Promise<{ id: string }> };

function statusClass(status: MemberStatus | MembershipStatus): string {
  if (status === "ACTIVE") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "FROZEN") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "EXPIRED") return "border-rose-200 bg-rose-50 text-rose-700";
  if (status === "CANCELLED") return "border-slate-200 bg-slate-100 text-slate-600";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function formatCurrency(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

function membershipDuration(startDate: string, endDate: string): string {
  const days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
  return `${days} ${days === 1 ? "day" : "days"}`;
}

export default async function MemberDetailsPage({ params }: PageProps) {
  const { gym } = await requireGymContext();
  const { id } = await params;
  const profile = await getMemberProfileData(gym.id, id);
  if (!profile) notFound();

  const { member, membershipHistory } = profile;
  const initials = member.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const currentMembership = member.membership;
  const isCurrentMembershipExpired = currentMembership?.status === "EXPIRED";

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8 sm:space-y-7">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl border-slate-200 bg-white shadow-sm">
          <Link href="/members" aria-label="Back to members"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">Member profile</p>
          <h1 className="mt-1 truncate font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{member.name}</h1>
        </div>
        <Button asChild variant="outline" className="ml-auto h-10 rounded-xl border-slate-200 bg-white">
          <Link href={`/members/${member.id}/edit`}><Edit3 className="mr-1.5 h-4 w-4 text-blue-500" />Edit profile</Link>
        </Button>
      </div>

      <section className="relative overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-cyan-50/70 p-5 shadow-[0_18px_50px_rgba(16,185,129,0.08)] sm:p-7 lg:p-8">
        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-teal-500 text-2xl font-black text-white shadow-xl shadow-emerald-500/20 sm:h-24 sm:w-24 sm:text-3xl">{initials}</div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{member.name}</h2>
                <Badge variant="outline" className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClass(member.status)}`}>{member.status}</Badge>
              </div>
              <p className="mt-1.5 text-sm text-slate-500">Member since {formatDate(member.joiningDate)} · {member.phone}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:ml-auto">
            <div className="rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Plan</p><p className="mt-1 max-w-32 truncate text-sm font-bold text-slate-800">{currentMembership?.plan ?? "Not assigned"}</p></div>
            <div className="rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ends</p><p className="mt-1 text-sm font-bold text-slate-800">{currentMembership ? formatDate(currentMembership.endDate) : "—"}</p></div>
            <div className="col-span-2 rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm sm:col-span-1"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Starting weight</p><p className="mt-1 text-sm font-bold text-slate-800">{currentMembership?.weightAtStart != null ? `${currentMembership.weightAtStart} kg` : "Not added"}</p></div>
          </div>
        </div>
      </section>

      {isCurrentMembershipExpired ? (
        <section className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div><p className="text-sm font-bold text-rose-800">Membership expired on {formatDate(currentMembership?.endDate ?? null)}</p><p className="mt-0.5 text-xs text-rose-600">Renew the membership to keep the member active in your gym.</p></div>
          <Button asChild className="h-10 shrink-0 rounded-xl bg-rose-600 hover:bg-rose-700"><Link href="/expiry">Open expiry</Link></Button>
        </section>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:p-7">
          <div className="mb-6 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><UserRound className="h-4 w-4" /></span><div><h2 className="font-heading text-base font-bold text-slate-800">Personal information</h2><p className="text-xs text-slate-400">Everything you need to know about this member.</p></div></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</p><p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><Phone className="h-4 w-4 text-emerald-500" />{member.phone}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</p><p className="mt-2 flex items-center gap-2 truncate text-sm font-semibold text-slate-700"><Mail className="h-4 w-4 text-blue-500" />{member.email || "Not provided"}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gender</p><p className="mt-2 text-sm font-semibold capitalize text-slate-700">{member.gender.toLowerCase()}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date of birth</p><p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><CalendarDays className="h-4 w-4 text-violet-500" />{formatDate(member.dateOfBirth)}</p></div>
            <div className="sm:col-span-2"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Address</p><p className="mt-2 flex items-start gap-2 text-sm font-semibold text-slate-700"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />{member.address || "Not provided"}</p></div>
            <div className="sm:col-span-2"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Emergency contact</p><p className="mt-2 text-sm font-semibold text-slate-700">{member.emergencyContact || "Not provided"}</p></div>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:p-7">
          <div className="mb-6 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600"><Sparkles className="h-4 w-4" /></span><div><h2 className="font-heading text-base font-bold text-slate-800">Current membership</h2><p className="text-xs text-slate-400">Latest plan and membership snapshot.</p></div></div>
          {currentMembership ? <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5"><div className="flex items-center justify-between gap-3"><Badge variant="outline" className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClass(currentMembership.status)}`}>{currentMembership.status}</Badge><span className="text-sm font-black text-slate-800">{formatCurrency(currentMembership.amount)}</span></div><p className="mt-4 text-xl font-black text-slate-800">{currentMembership.plan}</p><div className="mt-5 space-y-3 border-t border-emerald-100 pt-4 text-sm"><div className="flex justify-between gap-3"><span className="text-slate-400">Start</span><span className="font-semibold text-slate-700">{formatDate(currentMembership.startDate)}</span></div><div className="flex justify-between gap-3"><span className="text-slate-400">End</span><span className="font-semibold text-slate-700">{formatDate(currentMembership.endDate)}</span></div><div className="flex justify-between gap-3"><span className="flex items-center gap-2 text-slate-400"><Weight className="h-4 w-4" />Starting weight</span><span className="font-semibold text-slate-700">{currentMembership.weightAtStart != null ? `${currentMembership.weightAtStart} kg` : "Not added"}</span></div><div className="flex justify-between gap-3"><span className="text-slate-400">Duration</span><span className="font-semibold text-slate-700">{membershipDuration(currentMembership.startDate, currentMembership.endDate)}</span></div></div></div> : <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/30 px-4 text-center"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm"><ShieldAlert className="h-5 w-5" /></div><p className="mt-3 text-sm font-bold text-slate-700">No membership yet</p><p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">Assign a plan from Memberships when you are ready.</p><Button asChild size="sm" className="mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-700"><Link href="/memberships">Assign membership</Link></Button></div>}
        </section>
      </div>

      <section className="rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><History className="h-4 w-4" /></span><div><h2 className="font-heading text-base font-bold text-slate-800">Membership history</h2><p className="text-xs text-slate-400">Every membership period stays here for a complete record.</p></div></div><Badge variant="outline" className="w-fit rounded-full border-slate-200 bg-slate-50 text-slate-500">{membershipHistory.length} {membershipHistory.length === 1 ? "membership" : "memberships"}</Badge></div>
        {membershipHistory.length ? <div className="divide-y divide-slate-100">{membershipHistory.map((membership, index) => <div key={membership.id} className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6"><div className="flex min-w-0 gap-3"><div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${index === 0 ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>{index === 0 ? <CheckCircle2 className="h-4 w-4" /> : <History className="h-4 w-4" />}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-slate-800">{membership.plan}</p><Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusClass(membership.status)}`}>{membership.status}</Badge>{index === 0 ? <span className="text-[10px] font-semibold text-emerald-600">Latest</span> : null}</div><p className="mt-1 text-xs text-slate-400">{formatDate(membership.startDate)} → {formatDate(membership.endDate)}</p></div></div><div className="flex flex-wrap items-center gap-4 text-sm sm:justify-end"><div><p className="text-[10px] uppercase tracking-wider text-slate-400">Amount</p><p className="mt-0.5 font-bold text-slate-700">{formatCurrency(membership.amount)}</p></div><div><p className="text-[10px] uppercase tracking-wider text-slate-400">Start weight</p><p className="mt-0.5 font-bold text-slate-700">{membership.weightAtStart != null ? `${membership.weightAtStart} kg` : "Not added"}</p></div></div></div>)}</div> : <div className="px-5 py-12 text-center text-sm text-slate-400">No membership history yet.</div>}
      </section>
    </div>
  );
}
