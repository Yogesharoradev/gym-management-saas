"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema } from "@/lib/validation/auth";

interface ForgotResponse {
  message?: string;
  resetUrl?: string;
  error?: string;
}

const recoveryPoints = [
  "Secure reset link",
  "30-minute expiry",
  "Your account stays protected",
];

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);
  const [resetUrl, setResetUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = (await response.json()) as ForgotResponse;
      if (!response.ok) {
        setError(data.error ?? "Unable to process your request.");
        return;
      }

      setResetUrl(data.resetUrl ?? null);
      setIsSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.14),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(6,182,212,0.10),transparent_30%)]" />
      <div className="absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden flex-col justify-between border-r border-white/10 bg-gradient-to-br from-emerald-500/[0.08] via-transparent to-cyan-500/[0.04] p-10 lg:flex xl:p-12">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/20">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight">GymOS</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/35">Platform</p>
                </div>
              </div>

              <div className="mt-24 max-w-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400/80">Account recovery</p>
                <h1 className="mt-4 font-heading text-4xl font-black leading-tight tracking-tight xl:text-5xl">
                  Get back to your gym.
                  <span className="mt-1 block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Safely.</span>
                </h1>
                <p className="mt-5 text-sm leading-7 text-white/50">
                  Reset your Gym Admin password through a secure, time-limited recovery link.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {recoveryPoints.map((point) => (
                <div key={point} className="flex items-center gap-3 text-xs text-white/55">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  {point}
                </div>
              ))}
            </div>
          </section>

          <section className="flex min-h-[620px] items-center bg-neutral-950/70 p-6 sm:p-10 lg:p-12">
            <div className="mx-auto w-full max-w-md">
              <button type="button" onClick={() => router.replace("/login")} className="mb-10 text-xs font-medium text-white/40 transition-colors hover:text-white/75">
                ← Back to login
              </button>

              {isSent ? (
                <div className="animate-fade-in">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-400/20">
                    <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                  </div>
                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/80">Recovery link created</p>
                  <h2 className="mt-3 font-heading text-3xl font-black tracking-tight">Check your inbox</h2>
                  <p className="mt-4 text-sm leading-7 text-white/45">
                    If an active account exists for <span className="font-medium text-white/75">{email}</span>, a password reset link has been generated. The link expires in 30 minutes.
                  </p>

                  {resetUrl ? (
                    <div className="mt-7 rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] p-4 text-left">
                      <p className="text-xs font-semibold text-amber-300">Development test link</p>
                      <p className="mt-1 text-xs leading-5 text-amber-100/50">Email delivery is not configured yet. Use this link to test the reset flow.</p>
                      <button type="button" onClick={() => router.push(resetUrl)} className="mt-3 w-full break-all rounded-xl border border-white/10 bg-black/20 p-3 text-left text-xs font-medium text-amber-200 underline decoration-amber-400/30 underline-offset-4 hover:bg-black/30">
                        {resetUrl}
                      </button>
                    </div>
                  ) : null}

                  <Button variant="outline" className="mt-6 h-11 w-full border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:text-white" onClick={() => router.replace("/login")}>
                    Return to login
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-400/20">
                    <Mail className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Password recovery</p>
                  <h2 className="mt-3 font-heading text-3xl font-black tracking-tight">Forgot your password?</h2>
                  <p className="mt-4 text-sm leading-7 text-white/45">
                    Enter the email connected to your Gym Admin account and we&apos;ll send you a secure link to create a new password.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
                    {error ? (
                      <div className="flex items-start gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300" role="alert">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <Label htmlFor="forgot-email" className="text-xs font-medium text-white/60">Email address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                        <Input id="forgot-email" type="email" autoComplete="email" placeholder="you@gym.in" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 border-white/10 bg-white/[0.04] pl-10 text-white placeholder:text-white/20 focus:border-emerald-400/40 focus:ring-emerald-400/10" />
                      </div>
                    </div>

                    <Button type="submit" className="h-12 w-full bg-emerald-500 font-semibold text-neutral-950 shadow-lg shadow-emerald-500/10 hover:bg-emerald-400" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                      {isSubmitting ? "Sending…" : "Send reset link"}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
