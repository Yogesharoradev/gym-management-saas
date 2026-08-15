"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

interface LoginResponse {
  redirectTo?: string;
  error?: string;
}

/* ─── Forgot Password Dialog ─── */
function ForgotPasswordDialog() {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    // Simulate API call — replace with your actual endpoint
    await new Promise((r) => setTimeout(r, 1500));

    setIsSubmitting(false);
    setIsSent(true);
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-4"
          >
            Forgot password?
          </button>
        }
      />
      <DialogContent className="sm:max-w-md gap-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-bold tracking-tight">
            Reset your password
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </DialogDescription>
        </DialogHeader>

        {isSent ? (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 mb-4">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Check your inbox
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              We&apos;ve sent a password reset link to{" "}
              <span className="font-medium text-foreground">{email}</span>. The
              link will expire in 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@gym.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─── Login Form ─── */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, rememberMe }),
    });
    const data = (await res.json()) as LoginResponse;
    if (!res.ok) {
      setServerError(data.error ?? "Unable to sign in. Please try again.");
      return;
    }
    const target =
      searchParams.get("redirect") || data.redirectTo || "/dashboard";
    router.replace(target);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      data-testid="login-form"
      noValidate
    >
      {/* Server Error */}
      {serverError ? (
        <div
          className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-shake"
          data-testid="login-error"
          role="alert"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-3.5 w-3.5" />
          </div>
          <span className="mt-0.5">{serverError}</span>
        </div>
      ) : null}

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email address
        </Label>
        <div className="relative group">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@gym.in"
            data-testid="login-email-input"
            className="h-11 pl-10 transition-all duration-200 border-border/60 hover:border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            {...register("email")}
          />
          {emailValue && !errors.email ? (
            <CheckCircle2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
          ) : null}
        </div>
        {errors.email ? (
          <p
            className="flex items-center gap-1.5 text-xs text-destructive animate-fade-in"
            data-testid="email-error"
          >
            <AlertCircle className="h-3 w-3" />
            {errors.email.message}
          </p>
        ) : null}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <ForgotPasswordDialog />
        </div>
        <div className="relative group">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            data-testid="login-password-input"
            className="h-11 pl-10 pr-10 transition-all duration-200 border-border/60 hover:border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors focus:outline-none focus:text-primary"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password ? (
          <p
            className="flex items-center gap-1.5 text-xs text-destructive animate-fade-in"
            data-testid="password-error"
          >
            <AlertCircle className="h-3 w-3" />
            {errors.password.message}
          </p>
        ) : null}
      </div>

      {/* Remember Me */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked: any) => setRememberMe(checked === true)}
            className="border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Label
            htmlFor="remember"
            className="text-xs font-medium text-muted-foreground cursor-pointer select-none"
          >
            Keep me signed in for 30 days
          </Label>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-11 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
        size="lg"
        disabled={isSubmitting}
        data-testid="login-submit-button"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <ArrowRight className="h-4 w-4 mr-2" />
        )}
        {isSubmitting ? "Signing in…" : "Sign in to console"}
      </Button>
    </form>
  );
}
