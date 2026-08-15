"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  Calendar,
  Eye,
  Pencil,
  Ban,
  CheckCircle2,
  Loader2,
  Building2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, getInitials } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";

interface GymMobileCardProps {
  gym: {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    subscriptionStatus: string;
    createdAt: string;
  };
}

export function GymMobileCard({ gym }: GymMobileCardProps) {
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"suspend" | "reactivate" | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const isSuspended = gym.status === "SUSPENDED";

  function openDialog(type: "suspend" | "reactivate") {
    setDialogType(type);
    setDialogOpen(true);
  }

  async function handleConfirm() {
    if (!dialogType) return;

    setIsLoading(true);

    try {
      const newStatus = dialogType === "suspend" ? "SUSPENDED" : "ACTIVE";

      const res = await fetch(`/api/admin/gyms/${gym.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }

      toast.success(
        dialogType === "suspend"
          ? `${gym.name} has been suspended`
          : `${gym.name} has been reactivated`,
      );

      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
      setDialogOpen(false);
    }
  }

  const subscriptionStyles =
    gym.subscriptionStatus === "ACTIVE"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-400"
      : gym.subscriptionStatus === "PAST_DUE"
        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-400"
        : gym.subscriptionStatus === "SUSPENDED"
          ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-400"
          : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400";

  return (
    <>
      <Card className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700">
        <CardContent className="p-0">
          {/* Top accent */}
          <div
            className={`h-1 w-full ${
              isSuspended ? "bg-rose-500" : "bg-emerald-500"
            }`}
          />

          <div className="space-y-5 p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-bold text-slate-700 dark:from-slate-800 dark:to-slate-900 dark:text-slate-300">
                      {getInitials(gym.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Online/status dot */}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-950 ${
                      isSuspended ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
                      {gym.name}
                    </h3>
                  </div>

                  {gym.email ? (
                    <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                      {gym.email}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      No email provided
                    </p>
                  )}
                </div>
              </div>

              <Building2 className="mt-1 h-5 w-5 shrink-0 text-slate-300 dark:text-slate-700" />
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  gym.status === "ACTIVE"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-400"
                }`}
              >
                <span
                  className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                    gym.status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                {gym.status === "ACTIVE" ? "Active" : "Suspended"}
              </Badge>

              <Badge
                variant="outline"
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${subscriptionStyles}`}
              >
                {gym.subscriptionStatus.replace("_", " ")}
              </Badge>
            </div>

            {/* Information section */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="grid grid-cols-2 gap-3">
                {/* Created */}
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800">
                    <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Created
                    </p>
                    <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {formatDate(gym.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                {gym.phone ? (
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800">
                      <Phone className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        Phone
                      </p>
                      <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {gym.phone}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800">
                      <Phone className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        Phone
                      </p>
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        Not available
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Link href={`/super-admin/gyms/${gym.id}`}>
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    View
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Link href={`/super-admin/gyms/${gym.id}/edit`}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>

                {isSuspended ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-lg border-emerald-200 bg-emerald-50/50 text-xs font-semibold text-emerald-700 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                    onClick={() => openDialog("reactivate")}
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    Activate
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-lg border-rose-200 bg-rose-50/50 text-xs font-semibold text-rose-700 shadow-sm transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-800/60 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    onClick={() => openDialog("suspend")}
                  >
                    <Ban className="mr-1.5 h-3.5 w-3.5" />
                    Suspend
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl sm:max-w-md dark:border-slate-800">
          {/* Dialog top accent */}
          <div
            className={`h-1.5 w-full ${
              dialogType === "suspend" ? "bg-rose-500" : "bg-emerald-500"
            }`}
          />

          <div className="p-6">
            <DialogHeader className="text-left">
              {/* Icon */}
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                  dialogType === "suspend"
                    ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                }`}
              >
                {dialogType === "suspend" ? (
                  <AlertTriangle className="h-6 w-6" />
                ) : (
                  <ShieldCheck className="h-6 w-6" />
                )}
              </div>

              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {dialogType === "suspend"
                  ? "Suspend this gym?"
                  : "Reactivate this gym?"}
              </DialogTitle>

              <DialogDescription className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {dialogType === "suspend"
                  ? `Are you sure you want to suspend ${gym.name}? The gym will lose access to the GymOS console, but all business data will remain intact.`
                  : `Reactivate ${gym.name} and restore access to the GymOS console?`}
              </DialogDescription>
            </DialogHeader>

            {/* Gym preview */}
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
              <Avatar className="h-10 w-10 rounded-lg">
                <AvatarFallback className="rounded-lg bg-white text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {getInitials(gym.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {gym.name}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {gym.email || "No email provided"}
                </p>
              </div>
            </div>

            <DialogFooter className="mt-6 flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>

              <Button
                variant={dialogType === "suspend" ? "destructive" : "default"}
                onClick={handleConfirm}
                disabled={isLoading}
                className={
                  dialogType === "reactivate"
                    ? "w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
                    : "w-full sm:w-auto"
                }
              >
                {isLoading && <Loader2 className="animate-spin" />}

                {dialogType === "suspend" ? "Suspend Gym" : "Reactivate Gym"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
