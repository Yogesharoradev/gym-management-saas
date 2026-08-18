"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SerializedMember } from "@/lib/data/members";

interface MemberFormProps {
  mode: "create" | "edit";
  member?: SerializedMember;
}
type FormState = {
  name: string;
  phone: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  joiningDate: string;
};
function toInputDate(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "";
}

export function MemberForm({ mode, member }: MemberFormProps) {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>({
    name: member?.name ?? "",
    phone: member?.phone ?? "",
    email: member?.email ?? "",
    gender: member?.gender ?? "MALE",
    dateOfBirth: toInputDate(member?.dateOfBirth),
    address: member?.address ?? "",
    emergencyContact: member?.emergencyContact ?? "",
    joiningDate:
      toInputDate(member?.joiningDate) || new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const response = await fetch(
        mode === "create" ? "/api/members" : `/api/members/${member?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            dateOfBirth: form.dateOfBirth || null,
          }),
        },
      );
      const data = (await response.json()) as {
        error?: string;
        member?: SerializedMember;
      };
      if (!response.ok || !data.member) {
        setError(data.error ?? "Unable to save member");
        return;
      }
      router.push(`/members/${data.member.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-8xl space-y-5 sm:space-y-6"
    >
      <section className="relative overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-cyan-50/60 p-5 shadow-[0_18px_50px_rgba(16,185,129,0.07)] sm:p-7">
        <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-xl font-black text-slate-900">
                {mode === "create"
                  ? "Create member profile"
                  : "Update member profile"}
              </h2>
              <span className="hidden rounded-full border border-emerald-200 bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 sm:inline-flex">
                Fitaah
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Add the essentials now. You can manage membership details
              separately.
            </p>
          </div>
        </div>
      </section>
      {error ? (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5 text-sm font-medium text-rose-700">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <UserPlus className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-heading text-base font-bold text-slate-800">
                Personal details
              </h2>
              <p className="text-xs text-slate-400">
                How this member will appear across Fitaah.
              </p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label
                htmlFor="member-name"
                className="text-xs font-semibold text-slate-600"
              >
                Full name <span className="text-emerald-600">*</span>
              </Label>
              <Input
                id="member-name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Rahul Sharma"
                required
                className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="member-phone"
                className="text-xs font-semibold text-slate-600"
              >
                Phone <span className="text-emerald-600">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="member-phone"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="9876543210"
                  required
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-10 focus:border-emerald-300 focus:bg-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="member-email"
                className="text-xs font-semibold text-slate-600"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="member-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="rahul@example.com"
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-10 focus:border-emerald-300 focus:bg-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="member-gender"
                className="text-xs font-semibold text-slate-600"
              >
                Gender
              </Label>
              <select
                id="member-gender"
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="member-dob"
                className="text-xs font-semibold text-slate-600"
              >
                Date of birth
              </Label>
              <div className="relative">
                <CalendarDays className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="member-dob"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => update("dateOfBirth", e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-10 focus:border-emerald-300 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </section>
        <aside className="space-y-5">
          <section className="rounded-[1.5rem] border border-cyan-100 bg-gradient-to-br from-cyan-50/80 to-white p-5 shadow-[0_10px_35px_rgba(6,182,212,0.06)]">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Quick setup
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Only essential profile data is needed. Membership can be
                  assigned later.
                </p>
              </div>
            </div>
          </section>
          <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-heading text-sm font-bold text-slate-800">
                  Joining & contact
                </h2>
                <p className="text-[11px] text-slate-400">
                  Helpful for follow-ups and emergencies.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="member-joining"
                  className="text-xs font-semibold text-slate-600"
                >
                  Joining date <span className="text-emerald-600">*</span>
                </Label>
                <Input
                  id="member-joining"
                  type="date"
                  value={form.joiningDate}
                  onChange={(e) => update("joiningDate", e.target.value)}
                  required
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:border-emerald-300 focus:bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="member-address"
                  className="text-xs font-semibold text-slate-600"
                >
                  Address
                </Label>
                <Input
                  id="member-address"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="Area, city"
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:border-emerald-300 focus:bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="member-emergency"
                  className="text-xs font-semibold text-slate-600"
                >
                  Emergency contact
                </Label>
                <Input
                  id="member-emergency"
                  value={form.emergencyContact}
                  onChange={(e) => update("emergencyContact", e.target.value)}
                  placeholder="Name / phone"
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:border-emerald-300 focus:bg-white"
                />
              </div>
            </div>
          </section>
        </aside>
      </div>
      <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-xl shadow-slate-900/10 backdrop-blur sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="h-11 w-full rounded-xl border-slate-200 sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="h-11 w-full rounded-xl bg-emerald-600 font-semibold text-white shadow-lg shadow-emerald-600/15 hover:bg-emerald-700 sm:w-auto"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saving
            ? "Saving…"
            : mode === "create"
              ? "Create member"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
