"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  X,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createGymSchema, type CreateGymInput } from "@/lib/validation/gym";

interface CreateGymResponse {
  gym?: { id: string; name: string };
  admin?: { id: string; name: string; email: string };
  error?: string;
}

export default function NewGymPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successData, setSuccessData] = React.useState<{
    gymName: string;
    adminName: string;
    adminEmail: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateGymInput>({
    resolver: zodResolver(createGymSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      logo: null,
      admin: { name: "", email: "", password: "" },
    },
  });

  async function onSubmit(values: CreateGymInput) {
    setServerError(null);
    setSuccessData(null);

    try {
      const response = await fetch("/api/admin/gyms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email || "",
          phone: values.phone || "",
          address: values.address || "",
          logo: values.logo || null,
          admin: {
            name: values.admin.name,
            email: values.admin.email,
            password: values.admin.password,
          },
        }),
      });

      const data = (await response.json()) as CreateGymResponse;

      if (!response.ok) {
        setServerError(data.error ?? "Unable to create gym. Please try again.");
        return;
      }

      setSuccessData({
        gymName: data.gym?.name ?? "Gym",
        adminName: data.admin?.name ?? "",
        adminEmail: data.admin?.email ?? "",
      });

      window.setTimeout(() => {
        router.replace("/super-admin/gyms");
        router.refresh();
      }, 1500);
    } catch {
      setServerError(
        "Something went wrong while creating the gym. Please try again.",
      );
    }
  }

  return (
    <div className=" max-w-8xl mx-auto">
      {/* ─── CSS Animations ─── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); max-height: 0; }
          to { opacity: 1; transform: translateY(0); max-height: 200px; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-down {
          animation: slideDown 0.4s ease-out forwards;
          overflow: hidden;
        }
      `}</style>

      {/* ─── Back Button ─── */}
      <div
        className="animate-fade-in-up flex items-center"
        style={{ animationDelay: "0ms" }}
      >
        <Link href="/super-admin/gyms">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Gyms
          </Button>
        </Link>
      </div>

      {/* ─── Hero Header ─── */}
      <div
        className="animate-fade-in-up relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8 shadow-lg"
        style={{ animationDelay: "50ms" }}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-lg">
            <Sparkles className="h-7 w-7 text-white/90" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
              New Onboarding
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Create New Gym
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Add a gym and create its initial administrator account.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Alerts ─── */}
      {serverError && (
        <div className="animate-slide-down rounded-xl border border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/20 px-5 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                Unable to create gym
              </p>
              <p className="mt-0.5 text-sm text-rose-600 dark:text-rose-400">
                {serverError}
              </p>
            </div>
            <button
              onClick={() => setServerError(null)}
              className="text-rose-400 hover:text-rose-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {successData && (
        <div className="animate-slide-down rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20 px-5 py-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                Gym created successfully
              </p>
              <div className="mt-2 space-y-1 text-sm text-emerald-700 dark:text-emerald-400">
                <p>
                  <span className="font-medium">Gym:</span>{" "}
                  {successData.gymName}
                </p>
                <p>
                  <span className="font-medium">Admin:</span>{" "}
                  {successData.adminName}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {successData.adminEmail}
                </p>
              </div>
              <p className="mt-2 text-xs text-emerald-600/70 dark:text-emerald-500/70">
                Redirecting to gyms list...
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* ─── Gym Information ─── */}
        <div
          className="animate-fade-in-up rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
          style={{ animationDelay: "150ms" }}
        >
          <div className="border-b border-slate-100 dark:border-slate-800/80 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/20">
                <Building2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Gym Information
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Basic details about the gym.
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 grid gap-5 sm:grid-cols-2">
            {/* Gym Name */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Gym Name <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="name"
                  placeholder="Iron Pulse Fitness"
                  className="h-10 pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all duration-200"
                  {...register("name")}
                  aria-invalid={Boolean(errors.name)}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Gym Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="hello@gym.in"
                  className="h-10 pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all duration-200"
                  {...register("email")}
                  aria-invalid={Boolean(errors.email)}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  className="h-10 pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all duration-200"
                  {...register("phone")}
                  aria-invalid={Boolean(errors.phone)}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <Label
                htmlFor="logo"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Logo URL
              </Label>
              <div className="relative">
                <ImageIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="logo"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  className="h-10 pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all duration-200"
                  {...register("logo")}
                  aria-invalid={Boolean(errors.logo)}
                />
              </div>
              {errors.logo && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.logo.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2 sm:col-span-2">
              <Label
                htmlFor="address"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Address
              </Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  id="address"
                  rows={3}
                  placeholder="Enter complete gym address"
                  className="flex min-h-[90px] w-full resize-y rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all duration-200"
                  {...register("address")}
                  aria-invalid={Boolean(errors.address)}
                />
              </div>
              {errors.address && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ─── Gym Administrator ─── */}
        <div
          className="animate-fade-in-up rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
          style={{ animationDelay: "250ms" }}
        >
          <div className="border-b border-slate-100 dark:border-slate-800/80 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Gym Administrator
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Create the initial administrator account for this gym.
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 grid gap-5 sm:grid-cols-2">
            {/* Admin Name */}
            <div className="space-y-2">
              <Label
                htmlFor="admin-name"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Admin Name <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="admin-name"
                  placeholder="Rahul Sharma"
                  className="h-10 pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all duration-200"
                  {...register("admin.name")}
                  aria-invalid={Boolean(errors.admin?.name)}
                />
              </div>
              {errors.admin?.name && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.admin.name.message}
                </p>
              )}
            </div>

            {/* Admin Email */}
            <div className="space-y-2">
              <Label
                htmlFor="admin-email"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Admin Email <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@gym.in"
                  className="h-10 pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all duration-200"
                  {...register("admin.email")}
                  aria-invalid={Boolean(errors.admin?.email)}
                />
              </div>
              {errors.admin?.email && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.admin.email.message}
                </p>
              )}
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                This email will be used to sign in to the GymOS console.
              </p>
            </div>

            {/* Admin Password */}
            <div className="space-y-2 sm:col-span-2">
              <Label
                htmlFor="admin-password"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Temporary Password <span className="text-rose-500">*</span>
              </Label>
              <div className="relative max-w-md">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter a strong password"
                  className="h-10 pr-10 pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all duration-200"
                  {...register("admin.password")}
                  aria-invalid={Boolean(errors.admin?.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((c) => !c)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.admin?.password && (
                <p className="max-w-md text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.admin.password.message}
                </p>
              )}
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                This password is used for the initial administrator login.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Subscription Note ─── */}
        <div
          className="animate-fade-in-up flex items-start gap-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-5 py-4 text-xs"
          style={{ animationDelay: "350ms" }}
        >
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Subscription
            </p>
            <p className="mt-1 text-slate-500 dark:text-slate-500 leading-relaxed">
              New gyms are created with an active subscription. The current
              backend automatically starts a 30-day subscription period.
            </p>
          </div>
        </div>

        {/* ─── Actions ─── */}
        <div
          className="animate-fade-in-up flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800"
          style={{ animationDelay: "400ms" }}
        >
          <Link href="/super-admin/gyms">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="h-10 px-6 text-xs font-semibold w-full sm:w-auto border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-6 text-xs font-semibold w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Gym
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
