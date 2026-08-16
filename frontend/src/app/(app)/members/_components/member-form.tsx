"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SerializedMember } from "@/lib/data/members";

interface MemberFormProps { mode: "create" | "edit"; member?: SerializedMember; }
type FormState = { name: string; phone: string; email: string; gender: string; dateOfBirth: string; address: string; emergencyContact: string; joiningDate: string };

function toInputDate(value: string | null | undefined): string { return value ? value.slice(0, 10) : ""; }

export function MemberForm({ mode, member }: MemberFormProps) {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>({ name: member?.name ?? "", phone: member?.phone ?? "", email: member?.email ?? "", gender: member?.gender ?? "MALE", dateOfBirth: toInputDate(member?.dateOfBirth), address: member?.address ?? "", emergencyContact: member?.emergencyContact ?? "", joiningDate: toInputDate(member?.joiningDate) || new Date().toISOString().slice(0, 10) });
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  function update<K extends keyof FormState>(key: K, value: FormState[K]) { setForm((current) => ({ ...current, [key]: value })); }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null); setSaving(true);
    try {
      const response = await fetch(mode === "create" ? "/api/members" : `/api/members/${member?.id}`, { method: mode === "create" ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, dateOfBirth: form.dateOfBirth || null }) });
      const data = (await response.json()) as { error?: string; member?: SerializedMember };
      if (!response.ok || !data.member) { setError(data.error ?? "Unable to save member"); return; }
      router.push(`/members/${data.member.id}`); router.refresh();
    } catch { setError("Something went wrong. Please try again."); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-300">{error}</div> : null}
      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserPlus className="h-5 w-5" /></div><div><h2 className="font-heading text-base font-bold">Personal details</h2><p className="text-xs text-muted-foreground">Keep the member profile accurate and easy to identify.</p></div></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="member-name">Full name *</Label><Input id="member-name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Rahul Sharma" required /></div>
          <div className="space-y-2"><Label htmlFor="member-phone">Phone *</Label><Input id="member-phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="9876543210" required /></div>
          <div className="space-y-2"><Label htmlFor="member-email">Email</Label><Input id="member-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="rahul@example.com" /></div>
          <div className="space-y-2"><Label htmlFor="member-gender">Gender</Label><select id="member-gender" value={form.gender} onChange={(e) => update("gender", e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></div>
          <div className="space-y-2"><Label htmlFor="member-dob">Date of birth</Label><Input id="member-dob" type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} /></div>
        </div>
      </section>
      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6"><div className="mb-6"><h2 className="font-heading text-base font-bold">Contact & joining</h2><p className="text-xs text-muted-foreground">Useful information for communication and emergencies.</p></div><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2 sm:col-span-2"><Label htmlFor="member-address">Address</Label><Input id="member-address" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Street, area, city" /></div><div className="space-y-2"><Label htmlFor="member-emergency">Emergency contact</Label><Input id="member-emergency" value={form.emergencyContact} onChange={(e) => update("emergencyContact", e.target.value)} placeholder="Name / phone" /></div><div className="space-y-2"><Label htmlFor="member-joining">Joining date *</Label><Input id="member-joining" type="date" value={form.joiningDate} onChange={(e) => update("joiningDate", e.target.value)} required /></div></div></section>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto"><ArrowLeft className="mr-2 h-4 w-4" />Cancel</Button><Button type="submit" disabled={saving} className="w-full sm:w-auto">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{saving ? "Saving…" : mode === "create" ? "Add member" : "Save changes"}</Button></div>
    </form>
  );
}
