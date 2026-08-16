"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { strongPasswordSchema } from "@/lib/validation/auth";

interface ResetResponse { success?: boolean; error?: string }

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null);
    if (!token) { setError("This reset link is missing or invalid."); return; }
    const passwordResult = strongPasswordSchema.safeParse(password);
    if (!passwordResult.success) { setError(passwordResult.error.issues[0]?.message ?? "Invalid password."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const data = (await response.json()) as ResetResponse;
      if (!response.ok) { setError(data.error ?? "Unable to reset your password."); return; }
      setSuccess(true);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setIsSubmitting(false); }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.14),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(6,182,212,0.10),transparent_30%)]" />
      <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:32px_32px]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-5 py-8 sm:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden flex-col justify-between border-r border-white/10 bg-gradient-to-br from-emerald-500/[0.08] via-transparent to-cyan-500/[0.05] p-10 lg:flex xl:p-12">
            <div><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10"><KeyRound className="h-5 w-5 text-emerald-400" /></div><div><p className="font-heading text-lg font-black">GymOS</p><p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Gym Management</p></div></div><div className="mt-20 max-w-sm"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Secure password reset</div><h1 className="font-heading text-4xl font-black leading-tight tracking-tight xl:text-5xl">Protect your account. Get back in.</h1><p className="mt-5 text-sm leading-7 text-white/45">Choose a strong password and continue managing your gym with confidence.</p></div></div><div className="flex items-center gap-3 text-xs text-white/35"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" /> Secure recovery flow</div>
          </section>
          <section className="flex min-h-[620px] items-center justify-center p-6 sm:p-10 xl:p-14"><div className="w-full max-w-md">
            <button type="button" onClick={() => router.replace("/login")} className="mb-10 inline-flex items-center gap-2 text-xs font-medium text-white/40 transition-colors hover:text-white/80"><ArrowLeft className="h-3.5 w-3.5" /> Back to login</button>
            {success ? <div className="animate-fade-in"><div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10"><CheckCircle2 className="h-7 w-7 text-emerald-400" /></div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/70">All set</p><h2 className="mt-3 font-heading text-3xl font-black tracking-tight sm:text-4xl">Password updated</h2><p className="mt-4 text-sm leading-7 text-white/45">Your password has been reset successfully. Sign in with your new password to continue.</p><Button className="mt-7 h-12 w-full bg-emerald-500 font-semibold text-neutral-950 hover:bg-emerald-400" onClick={() => router.replace("/login")}>Continue to login<ArrowRight className="h-4 w-4" /></Button></div> : <><div className="mb-8"><div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]"><KeyRound className="h-5 w-5 text-emerald-400" /></div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Account recovery</p><h2 className="mt-3 font-heading text-3xl font-black tracking-tight sm:text-4xl">Create a new password</h2><p className="mt-4 text-sm leading-7 text-white/45">Use a strong password you don&apos;t use anywhere else.</p></div><form onSubmit={handleSubmit} className="space-y-5" noValidate>{error ? <div className="flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300" role="alert"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div> : null}<div className="space-y-2"><Label htmlFor="new-password" className="text-xs font-semibold text-white/60">New password</Label><div className="relative"><Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" /><Input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="h-12 border-white/10 bg-white/[0.04] pl-10 pr-10 text-white placeholder:text-white/20 focus:border-emerald-400/40 focus:ring-emerald-400/10" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div><p className="text-[11px] text-white/25">At least 8 characters.</p></div><div className="space-y-2"><Label htmlFor="confirm-password" className="text-xs font-semibold text-white/60">Confirm password</Label><div className="relative"><Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" /><Input id="confirm-password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="••••••••" className="h-12 border-white/10 bg-white/[0.04] pl-10 pr-10 text-white placeholder:text-white/20 focus:border-emerald-400/40 focus:ring-emerald-400/10" /><button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70" aria-label={showConfirmPassword ? "Hide password" : "Show password"}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div><Button type="submit" className="h-12 w-full bg-emerald-500 font-semibold text-neutral-950 shadow-lg shadow-emerald-500/10 hover:bg-emerald-400" disabled={isSubmitting || !token}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}{isSubmitting ? "Updating password…" : "Reset password"}</Button></form></>}
          </div></section>
        </div>
      </div>
    </main>
  );
}
