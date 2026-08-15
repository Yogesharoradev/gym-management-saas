"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Pencil,
  Ban,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface GymDetailActionsProps {
  gymId: string;
  name: string;
  status: string;
}

export function GymDetailActions({
  gymId,
  name,
  status,
}: GymDetailActionsProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"suspend" | "reactivate" | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const isSuspended = status === "SUSPENDED";

  function openDialog(type: "suspend" | "reactivate") {
    setDialogType(type);
    setDialogOpen(true);
  }

  async function handleConfirm() {
    if (!dialogType) return;
    setIsLoading(true);
    try {
      const newStatus = dialogType === "suspend" ? "SUSPENDED" : "ACTIVE";
      const res = await fetch(`/api/admin/gyms/${gymId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }

      toast.success(
        dialogType === "suspend"
          ? `${name} has been suspended`
          : `${name} has been reactivated`,
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
      setDialogOpen(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Link href={`/super-admin/gyms/${gymId}/edit`}>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5"
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit Gym
          </Button>
        </Link>
        {isSuspended ? (
          <Button
            size="sm"
            className="h-9 px-4 text-xs bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            onClick={() => openDialog("reactivate")}
          >
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            Reactivate
          </Button>
        ) : (
          <Button
            size="sm"
            className="h-9 px-4 text-xs bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            onClick={() => openDialog("suspend")}
          >
            <Ban className="mr-1.5 h-3.5 w-3.5" />
            Suspend
          </Button>
        )}
      </div>

      {/* ─── Beautiful Dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md border-0 shadow-2xl p-0 overflow-hidden">
          <div
            className={`h-1.5 w-full ${dialogType === "suspend" ? "bg-gradient-to-r from-rose-400 to-pink-500" : "bg-gradient-to-r from-emerald-400 to-teal-500"}`}
          />

          <div className="p-6">
            <DialogHeader className="space-y-4">
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${dialogType === "suspend" ? "bg-rose-50 dark:bg-rose-950/30" : "bg-emerald-50 dark:bg-emerald-950/30"}`}
              >
                {dialogType === "suspend" ? (
                  <AlertTriangle className="h-7 w-7 text-rose-500" />
                ) : (
                  <ShieldCheck className="h-7 w-7 text-emerald-500" />
                )}
              </div>
              <div className="text-center">
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  {dialogType === "suspend"
                    ? "Suspend Gym?"
                    : "Reactivate Gym?"}
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {dialogType === "suspend"
                    ? `Are you sure you want to suspend ${name}? The gym will lose access to the GymOS console, but all business data will remain intact.`
                    : `Reactivate ${name} and restore full access to the GymOS console? All previous data and settings will be preserved.`}
                </DialogDescription>
              </div>
            </DialogHeader>

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isLoading}
                className="w-full sm:w-auto h-10 text-xs font-semibold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </Button>
              <Button
                variant={dialogType === "suspend" ? "destructive" : "default"}
                onClick={handleConfirm}
                disabled={isLoading}
                className={`w-full sm:w-auto h-10 text-xs font-semibold transition-all duration-200 hover:shadow-lg ${
                  dialogType === "suspend"
                    ? "bg-rose-500 hover:bg-rose-600 hover:shadow-rose-500/25"
                    : "bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/25"
                }`}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {dialogType === "suspend" ? "Suspend Gym" : "Reactivate Gym"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
