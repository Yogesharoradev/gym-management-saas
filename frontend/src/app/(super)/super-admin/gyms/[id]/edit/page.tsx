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
  Calendar,
  ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateGymSchema, type UpdateGymInput } from "@/lib/validation/gym";
import { SUBSCRIPTION_STATUS } from "@/lib/constants";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface GymData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo: string | null;
  subscriptionStatus: string;
  subscriptionEndDate: string | null;
}

/* ─── Subscription Status Dot Badge ─── */
function SubStatusBadge({ status }: { status: string }) {
  const configs: Record<
    string,
    { dot: string; bg: string; text: string; label: string }
  > = {
    ACTIVE: {
      dot: "bg-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-700 dark:text-emerald-400",
      label: "Active",
    },
    PAST_DUE: {
      dot: "bg-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      text: "text-amber-700 dark:text-amber-400",
      label: "Past Due",
    },
    SUSPENDED: {
      dot: "bg-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      text: "text-rose-700 dark:text-rose-400",
      label: "Suspended",
    },
    CANCELLED: {
      dot: "bg-slate-400",
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-400",
      label: "Cancelled",
    },
  };
  const config = configs[status] || configs.CANCELLED;
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </div>
  );
}

export default function EditGymPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [gym, setGym] = React.useState<GymData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateGymInput>({
    resolver: zodResolver(updateGymSchema),
  });

  const currentSubStatus = watch("subscriptionStatus");

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/admin/gyms/${params.id}`);
        if (!res.ok) throw new Error("Gym not found");
        const data = await res.json();
        if (cancelled) return;

        setGym(data.gym);
        reset({
          name: data.gym.name,
          email: data.gym.email,
          phone: data.gym.phone,
          address: data.gym.address,
          logo: data.gym.logo,
          subscriptionStatus: data.gym.subscriptionStatus,
          subscriptionEndDate: data.gym.subscriptionEndDate
            ? new Date(data.gym.subscriptionEndDate).toISOString().slice(0, 16)
            : null,
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load gym");
        router.replace("/super-admin/gyms");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id, reset, router]);

  async function onSubmit(values: UpdateGymInput) {
    setServerError(null);

    try {
      const payload: UpdateGymInput = {
        ...values,
        subscriptionEndDate: values.subscriptionEndDate?.trim()
          ? new Date(values.subscriptionEndDate).toISOString()
          : null,
      };
      const res = await fetch(`/api/admin/gyms/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update gym");
      }

      toast.success("Gym updated successfully");
      router.push(`/super-admin/gyms/${params.id}`);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setServerError(message);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">Loading gym details...</p>
        </motion.div>
      </div>
    );
  }

  if (!gym) return null;

  return (
    <div className="space-y-6 max-w-8xl mx-auto">
      {/* ─── Back Button ─── */}
      <div className="flex items-center">
        <Link href={`/super-admin/gyms/${params.id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Gym
          </Button>
        </Link>
      </div>

      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8 shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-lg">
            <Building2 className="h-7 w-7 text-white/90" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
              Edit Mode
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {gym.name}
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Update gym information and subscription settings.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Server Error ─── */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/20 px-5 py-4 shadow-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                  Unable to save changes
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
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ─── Gym Information ─── */}
          <Card className="lg:col-span-2 border border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/20">
                  <Building2 className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                </div>
                Gym Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid gap-5 sm:grid-cols-2">
              {/* Gym Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Gym Name
                </Label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="name"
                    className="h-10 pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all duration-200"
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-rose-500 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.name.message}
                  </motion.p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    className="h-10 pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all duration-200"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-rose-500 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </motion.p>
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
                    className="h-10 pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all duration-200"
                    {...register("phone")}
                  />
                </div>
                {errors.phone && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-rose-500 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone.message}
                  </motion.p>
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
                  />
                </div>
                {errors.logo && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-rose-500 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.logo.message}
                  </motion.p>
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
                    className="flex min-h-[90px] w-full resize-y rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all duration-200"
                    {...register("address")}
                  />
                </div>
                {errors.address && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-rose-500 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.address.message}
                  </motion.p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ─── Subscription ─── */}
          <Card className="border border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {/* Status Preview */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <Shield className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Current Status
                    </p>
                    <div className="mt-0.5">
                      <SubStatusBadge
                        status={currentSubStatus || gym.subscriptionStatus}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Status */}
              <div className="space-y-2">
                <Label
                  htmlFor="subscriptionStatus"
                  className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Subscription Status
                </Label>
                <div className="relative">
                  <select
                    id="subscriptionStatus"
                    className="flex h-10 w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 pr-10 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all duration-200"
                    {...register("subscriptionStatus")}
                  >
                    <option value={SUBSCRIPTION_STATUS.ACTIVE}>Active</option>
                    <option value={SUBSCRIPTION_STATUS.PAST_DUE}>
                      Past Due
                    </option>
                    <option value={SUBSCRIPTION_STATUS.SUSPENDED}>
                      Suspended
                    </option>
                    <option value={SUBSCRIPTION_STATUS.CANCELLED}>
                      Cancelled
                    </option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    <svg
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.subscriptionStatus && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-rose-500 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.subscriptionStatus.message}
                  </motion.p>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label
                  htmlFor="subscriptionEndDate"
                  className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Subscription End Date
                </Label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="subscriptionEndDate"
                    type="datetime-local"
                    className="h-10 pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all duration-200 [color-scheme:light_dark]"
                    {...register("subscriptionEndDate")}
                  />
                </div>
                {errors.subscriptionEndDate && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-rose-500 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.subscriptionEndDate.message}
                  </motion.p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Actions ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800"
        >
          <Link href={`/super-admin/gyms/${params.id}`}>
            <Button
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
                Saving…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
