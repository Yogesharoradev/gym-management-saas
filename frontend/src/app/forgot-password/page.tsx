"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema } from "@/lib/validation/auth";

interface ForgotResponse {
  message?: string;
  resetUrl?: string;
  error?: string;
}

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

  if (isSent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center px-8 py-10 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <h1 className="font-heading text-2xl font-black tracking-tight">Check your inbox</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              If an active account exists for <span className="font-medium text-foreground">{email}</span>, a password reset link has been generated. The link expires in 30 minutes.
            </p>

            {resetUrl ? (
              <div className="mt-6 w-full rounded-lg border border-amber-300/50 bg-amber-50 p-3 text-left text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                <p className="font-semibold">Development test link</p>
                <p className="mt-1 break-all">Email delivery is not configured yet. Use this link to test the reset flow:</p>
                <button type="button" onClick={() => router.push(resetUrl)} className="mt-2 break-all text-left font-medium underline underline-offset-2 hover:no-underline">
                  {resetUrl}
                </button>
              </div>
            ) : null}

            <Button variant="outline" className="mt-6 w-full" onClick={() => router.replace("/login")}>
              Back to login
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 px-8 pt-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-muted/40">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black tracking-tight">Forgot password?</CardTitle>
            <CardDescription className="mt-2 leading-6">
              Enter the email connected to your Gym Admin account and we&apos;ll help you reset your password.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error ? (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive" role="alert">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input id="forgot-email" type="email" autoComplete="email" placeholder="you@gym.in" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 pl-10" />
              </div>
            </div>
            <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
              {isSubmitting ? "Sending…" : "Send reset link"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => router.replace("/login")}>
              Back to login
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
