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
import { Checkbox } from "@/components/ui/checkbox";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

interface LoginResponse {
  redirectTo?: string;
  error?: string;
}

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

    try {
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
          <p className="flex items-center gap-1.5 text-xs text-destructive animate-fade-in" data-testid="email-error">
            <AlertCircle className="h-3 w-3" />
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80 hover:underline underline-offset-4"
          >
            Forgot password?
          </Link>
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
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-muted-foreground focus:outline-none focus:text-primary"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password ? (
          <p className="flex items-center gap-1.5 text-xs text-destructive animate-fade-in" data-testid="password-error">
            <AlertCircle className="h-3 w-3" />
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            className="border-border/60 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
          />
          <Label
            htmlFor="remember"
            className="cursor-pointer select-none text-xs font-medium text-muted-foreground"
          >
            Keep me signed in for 30 days
          </Label>
        </div>
      </div>

      <Button
        type="submit"
        className="h-11 w-full text-sm font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary/30"
        size="lg"
        disabled={isSubmitting}
        data-testid="login-submit-button"
      >
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
        {isSubmitting ? "Signing in…" : "Sign in to console"}
      </Button>
    </form>
  );
}
