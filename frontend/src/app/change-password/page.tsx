"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { firstLoginPasswordSchema } from "@/lib/validation/auth";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = firstLoginPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please enter a valid password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json()) as { error?: string; redirectTo?: string };
      if (!response.ok) {
        setError(data.error ?? "Unable to update your password.");
        return;
      }
      router.replace(data.redirectTo ?? "/dashboard");
      router.refresh();
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
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/35">Secure onboarding</p>
                </div>
              </div>

              <div className="mt-24 max-w-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400/80">First-time setup</p>
                <h1 className="mt-4 font-heading text-4xl font-black leading-tight tracking-tight xl:text-5xl">
                  Make this account
                  <span className="mt-1 block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">yours.</span>
                </h1>
                <p className="mt-5 text-sm leading-7 text-white/50">
                  Your administrator created your account with an initial password. Set a private password before entering your gym workspace.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-white/55">
              <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-400" />Minimum 8 characters</div>
              <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-400" />Your password is securely hashed</div>
              <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-400" />You&apos;ll go straight to your dashboard</div>
            </div>
          </section>

          <section className="flex min-h-[620px] items-center bg-neutral-950/70 p-6 sm:p-10 lg:p-12">
            <div className="mx-auto w-full max-w-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-400/20">
                <KeyRound className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Required action</p>
              <h2 className="mt-3 font-heading text-3xl font-black tracking-tight">Create your password</h2>
              <p className="mt-4 text-sm leading-7 text-white/45">Choose a password only you know. You&apos;ll need it the next time you sign in.</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
                {error ? (
                  <div className="flex items-start gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300" role="alert">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : null}

                <PasswordField id="new-password" label="New password" value={password} onChange={setPassword} visible={showPassword} onToggle={() => setShowPassword((value) => !value)} />
                <PasswordField id="confirm-password" label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} visible={showConfirm} onToggle={() => setShowConfirm((value) => !value)} />

                <Button type="submit" className="h-12 w-full bg-emerald-500 font-semibold text-neutral-950 shadow-lg shadow-emerald-500/10 hover:bg-emerald-400" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  {isSubmitting ? "Saving password…" : "Save & continue"}
                </Button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function PasswordField({ id, label, value, onChange, visible, onToggle }: { id: string; label: string; value: string; onChange: (value: string) => void; visible: boolean; onToggle: () => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-medium text-white/60">{label}</Label>
      <div className="relative">
        <Input id={id} type={visible ? "text" : "password"} autoComplete={id === "new-password" ? "new-password" : "new-password"} value={value} onChange={(event) => onChange(event.target.value)} placeholder="••••••••" className="h-12 border-white/10 bg-white/[0.04] pr-11 text-white placeholder:text-white/20 focus:border-emerald-400/40 focus:ring-emerald-400/10" />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 transition-colors hover:text-white/60" aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
