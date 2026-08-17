"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

interface LoginResponse {
  redirectTo?: string;
  mustChangePassword?: boolean;
  error?: string;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

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

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as LoginResponse;
      if (!res.ok) {
        setServerError(data.error ?? "Unable to sign in. Please try again.");
        return;
      }

      const target = data.mustChangePassword
        ? "/change-password"
        : searchParams.get("redirect") || data.redirectTo || "/dashboard";

      router.replace(target);
      router.refresh();
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      data-testid="login-form"
      noValidate
    >
      {serverError ? (
        <div
          className="flex items-start gap-3 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300 animate-shake"
          data-testid="login-error"
          role="alert"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-400/10">
            <AlertCircle className="h-3.5 w-3.5" />
          </div>
          <span className="mt-0.5">{serverError}</span>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs font-medium text-white/60">
          Email address
        </Label>
        <div className="group relative">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25 transition-colors group-focus-within:text-emerald-400" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@gym.in"
            data-testid="login-email-input"
            className="h-12 border-white/10 bg-white/[0.035] pl-10 text-white placeholder:text-white/20 transition-all hover:border-white/15 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
            {...register("email")}
          />
          {emailValue && !errors.email ? (
            <CheckCircle2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
          ) : null}
        </div>
        {errors.email ? (
          <p className="flex items-center gap-1.5 text-xs text-red-300">
            <AlertCircle className="h-3 w-3" />
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs font-medium text-white/60">
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300 hover:underline underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>
        <div className="group relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25 transition-colors group-focus-within:text-emerald-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            data-testid="login-password-input"
            className="h-12 border-white/10 bg-white/[0.035] pl-10 pr-10 text-white placeholder:text-white/20 transition-all hover:border-white/15 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 transition-colors hover:text-white/60 focus:outline-none focus:text-emerald-400"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password ? (
          <p className="flex items-center gap-1.5 text-xs text-red-300">
            <AlertCircle className="h-3 w-3" />
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        className="h-12 w-full bg-emerald-500 text-sm font-semibold text-neutral-950 shadow-lg shadow-emerald-500/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-emerald-500/20"
        size="lg"
        disabled={isSubmitting}
        data-testid="login-submit-button"
      >
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="mr-2 h-4 w-4" />
        )}
        {isSubmitting ? "Signing in…" : "Sign in to console"}
      </Button>
    </form>
  );
}
