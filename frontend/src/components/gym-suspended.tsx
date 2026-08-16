"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import type { GymSummary } from "@/types";
import { GYM_STATUS } from "@/lib/constants";

export function GymSuspended({ gym }: { gym: GymSummary }) {
  const router = useRouter();
  const manuallySuspended = gym.status === GYM_STATUS.SUSPENDED;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md p-8 text-center" data-testid="gym-suspended">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-sm border border-destructive/30 bg-destructive/10 text-destructive">
          <Lock className="h-6 w-6" />
        </div>

        <h1 className="font-heading text-2xl font-black tracking-tighter">
          {manuallySuspended ? "Gym access suspended" : "Subscription expired"}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {manuallySuspended ? (
            <>
              Access to <span className="font-semibold text-foreground">{gym.name}</span>{" "}
              has been suspended by the platform administrator. Please contact the
              administrator to restore access.
            </>
          ) : (
            <>
              The subscription for{" "}
              <span className="font-semibold text-foreground">{gym.name}</span>{" "}
              has expired and the seven-day grace period has ended. Please contact the
              administrator to renew the subscription and restore access.
            </>
          )}
        </p>

        <div className="mt-4 flex justify-center">
          <StatusBadge status={gym.subscriptionStatus} />
        </div>

        <Button
          variant="outline"
          className="mt-6 w-full"
          onClick={handleLogout}
          data-testid="suspended-logout-button"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </Card>
    </div>
  );
}
