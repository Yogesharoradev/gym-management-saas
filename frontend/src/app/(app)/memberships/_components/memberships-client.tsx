"use client";

import * as React from "react";
import useSWR from "swr";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DURATION_UNIT,
  MEMBERSHIP_STATUS,
  type DurationUnit,
  type MembershipStatus,
} from "@/lib/constants";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Edit3,
  IndianRupee,
  Plus,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner"; // or your preferred toast library

interface Plan {
  id: string;
  name: string;
  duration: number;
  durationUnit: string;
  price: number;
  description: string;
  isActive: boolean;
}
interface Membership {
  id: string;
  member: { id: string; name: string; phone: string; status: string };
  plan: Plan;
  startDate: string;
  endDate: string;
  amount: number;
  weightAtStart: number | null;
  status: MembershipStatus;
}
interface MemberOption {
  id: string;
  name: string;
  phone: string;
}
interface MembershipResponse {
  memberships: Membership[];
  total: number;
  page: number;
  pageSize: number;
  stats: {
    total: number;
    active: number;
    expiring: number;
    expired: number;
    cancelled: number;
  };
}

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
function dateInput(value: Date): string {
  return value.toISOString().slice(0, 10);
}
function dateOnly(value: string): string {
  return value.slice(0, 10);
}
function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
function addDuration(start: string, duration: number, unit: string): string {
  const date = new Date(`${start}T00:00:00`);
  if (unit === DURATION_UNIT.DAY) date.setDate(date.getDate() + duration);
  else if (unit === DURATION_UNIT.YEAR)
    date.setFullYear(date.getFullYear() + duration);
  else date.setMonth(date.getMonth() + duration);
  date.setDate(date.getDate() - 1);
  return dateInput(date);
}
function statusClass(status: MembershipStatus): string {
  if (status === MEMBERSHIP_STATUS.ACTIVE)
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === MEMBERSHIP_STATUS.EXPIRED)
    return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-50 text-slate-500";
}

// Dialog component for reusability
function Dialog({
  open,
  onClose,
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div
          className={`w-full max-w-xl animate-in fade-in zoom-in-95 duration-200 ${className}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function DialogHeader({
  title,
  subtitle,
  badge,
  onClose,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
      <div className="pr-6">
        {badge && (
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
            {badge}
          </span>
        )}
        <h2 className="mt-1 text-xl font-bold text-slate-950">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function MembershipsClient() {
  const [tab, setTab] = React.useState<"memberships" | "plans">("memberships");
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"ALL" | MembershipStatus>("ALL");
  const [page, setPage] = React.useState(1);
  const [planOpen, setPlanOpen] = React.useState(false);
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<Plan | null>(null);
  const [editingMembership, setEditingMembership] =
    React.useState<Membership | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [planForm, setPlanForm] = React.useState({
    name: "",
    duration: "1",
    durationUnit: DURATION_UNIT.MONTH as DurationUnit,
    price: "",
    description: "",
  });
  const [assignForm, setAssignForm] = React.useState({
    memberId: "",
    planId: "",
    startDate: dateInput(new Date()),
    endDate: dateInput(new Date()),
    amount: "",
    paymentAmount: "",
    weightAtStart: "",

    // Payment details
    paymentMethod: "CASH",
    paymentDate: dateInput(new Date()),
    transactionReference: "",
    paymentNotes: "",
  });
  const [editForm, setEditForm] = React.useState({
    planId: "",
    startDate: "",
    endDate: "",
    amount: "",
    weightAtStart: "",
  });
  const [memberQuery, setMemberQuery] = React.useState("");

  const fetcher = React.useCallback(async <T,>(url: string): Promise<T> => {
    const response = await fetch(url);
    const data = (await response.json()) as T & { error?: string };

    if (!response.ok) {
      throw new Error(data.error ?? "Unable to load data");
    }

    return data;
  }, []);

  const membershipKey = React.useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "12",
    });

    if (query.trim()) params.set("q", query.trim());
    if (status !== "ALL") params.set("status", status);

    return `/api/memberships?${params.toString()}`;
  }, [page, query, status]);

  const {
    data: membershipData,
    error: membershipError,
    isLoading: membershipsLoading,
    mutate: mutateMemberships,
  } = useSWR<MembershipResponse>(membershipKey, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  const {
    data: plansData,
    error: plansError,
    isLoading: plansLoading,
    mutate: mutatePlans,
  } = useSWR<{ plans: Plan[] }>("/api/membership-plans", fetcher, {
    revalidateOnFocus: false,
  });

  // Fetch ALL memberships to know which members already have active memberships
  const { data: allMembershipsData } = useSWR<MembershipResponse>(
    "/api/memberships?pageSize=1000",
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const memberKey = React.useMemo(() => {
    if (!assignOpen) return null;

    const params = new URLSearchParams({
      page: "1",
      pageSize: "50",
    });

    if (memberQuery.trim()) params.set("q", memberQuery.trim());

    return `/api/members?${params.toString()}`;
  }, [assignOpen, memberQuery]);

  const { data: membersData, error: membersError } = useSWR<{
    members: MemberOption[];
  }>(memberKey, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  const memberships = membershipData?.memberships ?? [];
  const plans = plansData?.plans ?? [];
  const members = membersData?.members ?? [];
  const allMemberships = allMembershipsData?.memberships ?? [];
  const stats = membershipData?.stats ?? {
    total: 0,
    active: 0,
    expiring: 0,
    expired: 0,
    cancelled: 0,
  };

  const loading = membershipsLoading || (tab === "plans" && plansLoading);

  React.useEffect(() => {
    const swrError = membershipError ?? plansError ?? membersError;

    if (swrError) {
      setError(
        swrError instanceof Error ? swrError.message : "Unable to load data",
      );
    }
  }, [membershipError, plansError, membersError]);

  // Get IDs of members who already have active memberships
  const activeMemberIds = React.useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return new Set(
      allMemberships
        .filter((m) => {
          const status = m.status;
          // Check if membership is active or expiring (not expired or cancelled)
          return (
            status === MEMBERSHIP_STATUS.ACTIVE ||
            status === MEMBERSHIP_STATUS.EXPIRED
          );
        })
        .map((m) => m.member.id),
    );
  }, [allMemberships]);

  // Filter members to exclude those with active memberships
  const availableMembers = React.useMemo(() => {
    return members.filter((member) => !activeMemberIds.has(member.id));
  }, [members, activeMemberIds]);

  function openPlan(plan?: Plan): void {
    setEditingPlan(plan ?? null);
    setPlanForm(
      plan
        ? {
            name: plan.name,
            duration: String(plan.duration),
            durationUnit: plan.durationUnit as DurationUnit,
            price: String(plan.price),
            description: plan.description,
          }
        : {
            name: "",
            duration: "1",
            durationUnit: DURATION_UNIT.MONTH,
            price: "",
            description: "",
          },
    );
    setPlanOpen(true);
  }
  function openAssign(): void {
    const first = plans.find((plan) => plan.isActive);
    const start = dateInput(new Date());

    setMemberQuery("");

    setAssignForm({
      memberId: "",
      planId: first?.id ?? "",
      startDate: start,
      endDate: first
        ? addDuration(start, first.duration, first.durationUnit)
        : start,
      amount: first ? String(first.price) : "",
      paymentAmount: first ? String(first.price) : "",
      weightAtStart: "",

      paymentMethod: "CASH",
      paymentDate: dateInput(new Date()),
      transactionReference: "",
      paymentNotes: "",
    });

    setAssignOpen(true);
  }
  function openEditMembership(membership: Membership): void {
    setEditingMembership(membership);
    setEditForm({
      planId: membership.plan.id,
      startDate: dateOnly(membership.startDate),
      endDate: dateOnly(membership.endDate),
      amount: String(membership.amount),
      weightAtStart:
        membership.weightAtStart === null
          ? ""
          : String(membership.weightAtStart),
    });
    setEditOpen(true);
  }
  function selectAssignPlan(planId: string): void {
    const plan = plans.find((item) => item.id === planId);
    setAssignForm((current) => ({
      ...current,
      planId,
      amount: plan ? String(plan.price) : "",
      paymentAmount: plan ? String(plan.price) : "",
      endDate: plan
        ? addDuration(current.startDate, plan.duration, plan.durationUnit)
        : current.endDate,
    }));
  }
  function selectAssignStart(startDate: string): void {
    const plan = plans.find((item) => item.id === assignForm.planId);
    setAssignForm((current) => ({
      ...current,
      startDate,
      endDate: plan
        ? addDuration(startDate, plan.duration, plan.durationUnit)
        : current.endDate,
    }));
  }
  function selectEditPlan(planId: string): void {
    const plan = plans.find((item) => item.id === planId);
    setEditForm((current) => ({
      ...current,
      planId,
      amount: plan ? String(plan.price) : current.amount,
    }));
  }

  async function savePlan(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: planForm.name,
        duration: Number(planForm.duration),
        durationUnit: planForm.durationUnit,
        price: Number(planForm.price),
        description: planForm.description,
        isActive: editingPlan?.isActive ?? true,
      };
      const response = await fetch(
        editingPlan
          ? `/api/membership-plans/${editingPlan.id}`
          : "/api/membership-plans",
        {
          method: editingPlan ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to save plan");
      await mutatePlans();
      setPlanOpen(false);
      toast.success(
        editingPlan ? "Plan updated successfully" : "Plan created successfully",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save plan");
    } finally {
      setSaving(false);
    }
  }
  async function assignMembership(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId: assignForm.memberId,
          planId: assignForm.planId,
          startDate: assignForm.startDate,
          endDate: assignForm.endDate,
          amount: Number(assignForm.amount),
          weightAtStart: assignForm.weightAtStart
            ? Number(assignForm.weightAtStart)
            : null,

          payment: {
            amount: Number(assignForm.paymentAmount),
            method: assignForm.paymentMethod,
            paymentDate: assignForm.paymentDate,
            transactionReference: assignForm.transactionReference.trim(),
            notes: assignForm.paymentNotes.trim(),
          },
        }),
      });

      const data = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to assign membership");
      }

      await mutateMemberships();
      setAssignOpen(false);
      toast.success("Membership assigned successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to assign membership",
      );
    } finally {
      setSaving(false);
    }
  }
  async function saveMembership(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (!editingMembership) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/memberships/${editingMembership.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: editForm.planId,
          startDate: editForm.startDate,
          endDate: editForm.endDate,
          amount: Number(editForm.amount),
          weightAtStart:
            editForm.weightAtStart === ""
              ? null
              : Number(editForm.weightAtStart),
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(data.error ?? "Unable to update membership");
      await mutateMemberships();
      setEditOpen(false);
      setEditingMembership(null);
      toast.success("Membership updated successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to update membership",
      );
    } finally {
      setSaving(false);
    }
  }
  async function togglePlan(plan: Plan): Promise<void> {
    try {
      const response = await fetch(`/api/membership-plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      if (response.ok) {
        await mutatePlans();
        toast.success(
          `Plan ${plan.isActive ? "paused" : "activated"} successfully`,
        );
      }
    } catch (err) {
      toast.error("Unable to update plan status");
    }
  }

  const pages = Math.max(1, Math.ceil(stats.total / 12));
  const activePlans = plans.filter((plan) => plan.isActive);
  const selectedMember =
    availableMembers.find((member) => member.id === assignForm.memberId) ??
    null;
  const filteredMembers = memberQuery.trim()
    ? availableMembers
    : availableMembers.slice(0, 6);
  const editPlans =
    editingMembership &&
    !editingMembership.plan.isActive &&
    !plans.some((plan) => plan.id === editingMembership.plan.id)
      ? [...plans, editingMembership.plan]
      : plans;
  const field =
    "mt-2 h-11 rounded-lg border-slate-200 bg-white shadow-none focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/15";

  return (
    <div className="space-y-6 sm:space-y-7">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-cyan-50/70 p-5 shadow-[0_18px_50px_rgba(16,185,129,0.08)] sm:p-7 lg:p-8">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Membership management
            </div>
            <h1 className="font-heading text-3xl font-black tracking-[-0.035em] text-slate-900 sm:text-4xl">
              Plans, memberships, all in one place.
            </h1>
            <p className="mt-2.5 max-w-xl text-sm leading-6 text-slate-500">
              Create your gym's plans, assign them in seconds, and keep renewals
              visible before they become a problem.
            </p>
          </div>
          <Button
            onClick={() => (tab === "plans" ? openPlan() : openAssign())}
            className="h-11 w-full rounded-xl bg-emerald-600 px-5 font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 sm:w-auto"
          >
            <Plus className="mr-2 inline h-4 w-4" />
            {tab === "plans" ? "Create plan" : "Assign membership"}
          </Button>
        </div>
        <div className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
          {[
            { label: "Total", value: stats.total },
            { label: "Active", value: stats.active },
            { label: "Expiring", value: stats.expiring },
            { label: "Expired", value: stats.expired },
            { label: "Cancelled", value: stats.cancelled },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/80 bg-white/75 p-3 sm:p-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {item.label}
              </p>
              <p className="mt-1 text-xl font-black text-slate-800 sm:text-2xl">
                {loading ? "—" : item.value}
              </p>
            </div>
          ))}
        </div>
      </section>
      <div className="flex w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm sm:w-fit">
        <button
          type="button"
          onClick={() => setTab("memberships")}
          className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold ${tab === "memberships" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          Memberships
        </button>
        <button
          type="button"
          onClick={() => setTab("plans")}
          className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold ${tab === "plans" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          Membership plans{" "}
          <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
            {plans.length}
          </span>
        </button>
      </div>
      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <X className="h-4 w-4" />
          {error}
        </div>
      ) : null}

      {tab === "plans" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="rounded-[1.5rem] border-slate-200/80 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <Badge
                  variant="outline"
                  className={`rounded-full ${plan.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}
                >
                  {plan.isActive ? "ACTIVE" : "PAUSED"}
                </Badge>
              </div>
              <h2 className="mt-5 text-lg font-bold text-slate-900">
                {plan.name}
              </h2>
              <p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">
                {plan.description || "No description added."}
              </p>
              <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
                <div>
                  <p className="text-2xl font-black text-slate-900">
                    {money.format(plan.price)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {plan.duration} {plan.durationUnit.toLowerCase()}
                    {plan.duration > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openPlan(plan)}
                    className="rounded-lg"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void togglePlan(plan)}
                    className="rounded-lg text-xs"
                  >
                    {plan.isActive ? "Pause" : "Activate"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {plans.length === 0 ? (
            <Card className="col-span-full flex min-h-64 flex-col items-center justify-center rounded-[1.5rem] border-dashed p-8 text-center">
              <CreditCard className="h-6 w-6 text-emerald-600" />
              <h2 className="mt-4 font-bold text-slate-800">
                Create your first plan
              </h2>
              <Button
                onClick={() => openPlan()}
                className="mt-4 rounded-xl bg-emerald-600"
              >
                Create plan
              </Button>
            </Card>
          ) : null}
        </div>
      ) : (
        <Card className="overflow-hidden rounded-[1.5rem] border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => {
                  setPage(1);
                  setQuery(event.target.value);
                }}
                placeholder="Search member name or phone..."
                className="h-11 rounded-xl border-slate-200 bg-slate-50/70 pl-10"
              />
            </div>
            <div className="flex w-full overflow-x-auto rounded-xl bg-slate-100 p-1 lg:w-auto">
              {(["ALL", "ACTIVE", "EXPIRED", "CANCELLED"] as const).map(
                (item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => {
                      setPage(1);
                      setStatus(item);
                    }}
                    className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${status === item ? "bg-white text-slate-800 shadow-sm" : "text-slate-400"}`}
                  >
                    {item === "ALL"
                      ? "All"
                      : item.charAt(0) + item.slice(1).toLowerCase()}
                  </button>
                ),
              )}
            </div>
          </div>
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
                <UserRound className="h-6 w-6" />
              </div>
              <h2 className="mt-4 font-bold text-slate-800">
                No memberships yet
              </h2>
              <Button
                onClick={openAssign}
                className="mt-4 rounded-xl bg-emerald-600"
              >
                Assign membership
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1020px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        Member
                      </th>
                      <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        Plan
                      </th>
                      <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        Validity
                      </th>
                      <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        Amount
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
                    {memberships.map((membership) => (
                      <tr
                        key={membership.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-emerald-50/25"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/members/${membership.member.id}`}
                            className="font-semibold text-slate-800 hover:text-emerald-700"
                          >
                            {membership.member.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {membership.member.phone}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-700">
                            {membership.plan.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {membership.plan.duration}{" "}
                            {membership.plan.durationUnit.toLowerCase()}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-700">
                            {formatDate(membership.startDate)}
                          </p>
                          <p className="text-xs text-slate-400">
                            to {formatDate(membership.endDate)}
                          </p>
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-700">
                          {money.format(membership.amount)}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {membership.weightAtStart !== null ? (
                            `${membership.weightAtStart} kg`
                          ) : (
                            <span className="font-medium text-amber-600">
                              Not added
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            variant="outline"
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClass(membership.status)}`}
                          >
                            {membership.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditMembership(membership)}
                            className="inline-flex items-center gap-1.5 rounded-lg text-xs"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  Showing {memberships.length} of {stats.total} memberships
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-slate-100 px-3 text-xs font-bold">
                    {page} / {pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Plan Dialog */}
      <Dialog open={planOpen} onClose={() => setPlanOpen(false)}>
        <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
          <DialogHeader
            badge="Membership plans"
            title={
              editingPlan ? "Edit membership plan" : "Create a membership plan"
            }
            subtitle={
              editingPlan
                ? "Update plan details and pricing."
                : "Add a new plan for your members."
            }
            onClose={() => setPlanOpen(false)}
          />
          <form onSubmit={(event) => void savePlan(event)}>
            <div className="space-y-5 p-6">
              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Plan name
                </label>
                <Input
                  required
                  value={planForm.name}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, name: e.target.value })
                  }
                  placeholder="e.g. Monthly Fitness"
                  className={field}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-800">
                    Duration
                  </label>
                  <Input
                    required
                    type="number"
                    min="1"
                    value={planForm.duration}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, duration: e.target.value })
                    }
                    className={field}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-800">
                    Billing period
                  </label>
                  <select
                    value={planForm.durationUnit}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        durationUnit: e.target.value as DurationUnit,
                      })
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                  >
                    <option value={DURATION_UNIT.DAY}>Days</option>
                    <option value={DURATION_UNIT.MONTH}>Months</option>
                    <option value={DURATION_UNIT.YEAR}>Years</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Price
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    required
                    type="number"
                    min="0"
                    value={planForm.price}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, price: e.target.value })
                    }
                    className={`${field} pl-9`}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Description{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  value={planForm.description}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, description: e.target.value })
                  }
                  className="mt-2 min-h-28 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                  placeholder="Describe what this plan includes..."
                />
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/60 p-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPlanOpen(false)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                disabled={saving}
                type="submit"
                className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
              >
                {saving
                  ? "Saving…"
                  : editingPlan
                    ? "Save changes"
                    : "Create plan"}
              </Button>
            </div>
          </form>
        </Card>
      </Dialog>

      {/* Assign Membership Dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)}>
        <Card className="flex max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
          <div className="flex flex-col flex-1 min-h-0">
            <DialogHeader
              badge="New membership"
              title="Assign membership"
              subtitle="Link a member to a plan and set the details."
              onClose={() => setAssignOpen(false)}
            />
            <form
              onSubmit={(event) => void assignMembership(event)}
              className="flex-1 overflow-y-auto"
            >
              <div className="space-y-5 p-6">
                <section>
                  <label className="text-sm font-semibold text-slate-800">
                    Select member
                  </label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={memberQuery}
                      onChange={(e) => setMemberQuery(e.target.value)}
                      placeholder="Search by name or phone"
                      className="h-11 rounded-lg border-slate-200 pl-9 focus-visible:ring-2 focus-visible:ring-emerald-500/15"
                    />
                  </div>
                  {selectedMember ? (
                    <div className="mt-2 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {selectedMember.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {selectedMember.phone}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setAssignForm({ ...assignForm, memberId: "" })
                        }
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-slate-200">
                      {filteredMembers.length ? (
                        filteredMembers.map((member) => (
                          <button
                            type="button"
                            key={member.id}
                            onClick={() =>
                              setAssignForm({
                                ...assignForm,
                                memberId: member.id,
                              })
                            }
                            className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50"
                          >
                            <div>
                              <span className="block text-sm font-medium text-slate-800">
                                {member.name}
                              </span>
                              <span className="block text-xs text-slate-400">
                                {member.phone}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-emerald-600">
                              Select
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="p-4 text-center text-xs text-slate-400">
                          {memberQuery.trim()
                            ? "No available members found"
                            : "No members available to assign"}
                        </p>
                      )}
                    </div>
                  )}
                  {availableMembers.length === 0 && !selectedMember && (
                    <p className="mt-2 text-xs text-amber-600">
                      All members already have active memberships
                    </p>
                  )}
                </section>
                <div>
                  <label className="text-sm font-semibold text-slate-800">
                    Membership plan
                  </label>
                  <select
                    required
                    value={assignForm.planId}
                    onChange={(e) => selectAssignPlan(e.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                  >
                    <option value="">Select a plan</option>
                    {activePlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} · {money.format(plan.price)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-800">
                      Start date
                    </label>
                    <Input
                      required
                      type="date"
                      value={assignForm.startDate}
                      onChange={(e) => selectAssignStart(e.target.value)}
                      className={field}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-800">
                      End date
                    </label>
                    <Input
                      required
                      type="date"
                      value={assignForm.endDate}
                      onChange={(e) =>
                        setAssignForm({
                          ...assignForm,
                          endDate: e.target.value,
                        })
                      }
                      className={field}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-800">
                      Membership amount
                    </label>
                    <Input
                      required
                      type="number"
                      min="0"
                      value={assignForm.amount}
                      readOnly
                      className={`${field} bg-slate-50 cursor-not-allowed`}
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      Total value of this membership (auto-filled from plan)
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-800">
                      Starting weight{" "}
                      <span className="font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={assignForm.weightAtStart}
                      onChange={(e) =>
                        setAssignForm({
                          ...assignForm,
                          weightAtStart: e.target.value,
                        })
                      }
                      placeholder="e.g. 72.5"
                      className={field}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Starts {formatDate(assignForm.startDate)}
                    </p>
                    <p className="text-xs text-slate-500">
                      The selected plan suggests the end date automatically.
                    </p>
                  </div>
                </div>

                {/* Payment Details */}
                <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-800">
                      Payment details
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Record the payment received for this membership.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-slate-800">
                        Amount received
                      </label>
                      <Input
                        required
                        type="number"
                        min="0"
                        value={assignForm.paymentAmount}
                        onChange={(e) =>
                          setAssignForm({
                            ...assignForm,
                            paymentAmount: e.target.value,
                          })
                        }
                        className={field}
                      />
                      <p className="mt-1 text-xs text-slate-400">
                        Actual payment received (can be partial)
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-800">
                        Payment method
                      </label>

                      <select
                        required
                        value={assignForm.paymentMethod}
                        onChange={(e) =>
                          setAssignForm({
                            ...assignForm,
                            paymentMethod: e.target.value,
                          })
                        }
                        className={field}
                      >
                        <option value="CASH">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="CARD">Card</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-800">
                        Payment date
                      </label>

                      <Input
                        required
                        type="date"
                        value={assignForm.paymentDate}
                        onChange={(e) =>
                          setAssignForm({
                            ...assignForm,
                            paymentDate: e.target.value,
                          })
                        }
                        className={field}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-semibold text-slate-800">
                      Transaction reference{" "}
                      <span className="font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>

                    <Input
                      value={assignForm.transactionReference}
                      onChange={(e) =>
                        setAssignForm({
                          ...assignForm,
                          transactionReference: e.target.value,
                        })
                      }
                      placeholder="e.g. UPI transaction ID"
                      className={field}
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-semibold text-slate-800">
                      Payment notes{" "}
                      <span className="font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>

                    <textarea
                      value={assignForm.paymentNotes}
                      onChange={(e) =>
                        setAssignForm({
                          ...assignForm,
                          paymentNotes: e.target.value,
                        })
                      }
                      placeholder="Add any payment notes..."
                      rows={3}
                      className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                    />
                  </div>
                </section>
              </div>
              <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/60 p-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAssignOpen(false)}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  disabled={
                    saving || !activePlans.length || !assignForm.memberId
                  }
                  type="submit"
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                >
                  {saving ? "Assigning…" : "Assign membership"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </Dialog>

      {/* Edit Membership Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <Card className="flex max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
          <div className="flex flex-col flex-1 min-h-0">
            <DialogHeader
              badge="Membership details"
              title="Edit membership"
              subtitle="Update plan, dates, amount, or starting weight."
              onClose={() => setEditOpen(false)}
            />
            {editingMembership && (
              <form
                onSubmit={(event) => void saveMembership(event)}
                className="flex-1 overflow-y-auto"
              >
                <div className="space-y-5 p-6">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Member
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {editingMembership.member.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {editingMembership.member.phone}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-800">
                      Membership plan
                    </label>
                    <select
                      required
                      value={editForm.planId}
                      onChange={(e) => selectEditPlan(e.target.value)}
                      className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                    >
                      <option value="">Select a plan</option>
                      {editPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} · {money.format(plan.price)}
                          {!plan.isActive ? " · Paused" : ""}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-xs text-slate-400">
                      Changing the plan also updates the amount to that plan's
                      price; you can override it.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-slate-800">
                        Start date
                      </label>
                      <Input
                        required
                        type="date"
                        value={editForm.startDate}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            startDate: e.target.value,
                          })
                        }
                        className={field}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-800">
                        End date
                      </label>
                      <Input
                        required
                        type="date"
                        value={editForm.endDate}
                        onChange={(e) =>
                          setEditForm({ ...editForm, endDate: e.target.value })
                        }
                        className={field}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-slate-800">
                        Amount
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          required
                          type="number"
                          min="0"
                          value={editForm.amount}
                          onChange={(e) =>
                            setEditForm({ ...editForm, amount: e.target.value })
                          }
                          className={`${field} pl-9`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-800">
                        Starting weight{" "}
                        <span className="font-normal text-slate-400">
                          (optional)
                        </span>
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={editForm.weightAtStart}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            weightAtStart: e.target.value,
                          })
                        }
                        placeholder="e.g. 72.5"
                        className={field}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/60 p-4 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditOpen(false)}
                    className="rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={saving}
                    type="submit"
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                  >
                    {saving ? "Saving…" : "Save membership"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>
      </Dialog>
    </div>
  );
}
