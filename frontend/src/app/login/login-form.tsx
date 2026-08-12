"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

interface LoginResponse {
  redirectTo?: string;
  error?: string;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
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
    const target = searchParams.get("redirect") || data.redirectTo || "/dashboard";
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
      {serverError ? (
        <div
          className="flex items-start gap-2 rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          data-testid="login-error"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@gym.in"
          data-testid="login-email-input"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-xs text-destructive" data-testid="email-error">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          data-testid="login-password-input"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-xs text-destructive" data-testid="password-error">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
        data-testid="login-submit-button"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
