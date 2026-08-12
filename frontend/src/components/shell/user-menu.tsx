"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import type { SessionUser } from "@/types";

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  GYM_ADMIN: "Gym Admin",
  STAFF: "Staff",
};

export function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Signed out");
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Could not sign out. Please try again.");
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-sm border border-border bg-background px-2 py-1.5 text-left transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-testid="user-menu-trigger"
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="hidden leading-tight sm:block">
          <p className="max-w-[10rem] truncate text-sm font-semibold">{user.name}</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {ROLE_LABEL[user.role] ?? user.role}
          </p>
        </div>
        <ChevronsUpDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleLogout}
          disabled={loading}
          data-testid="logout-button"
        >
          <LogOut className="h-4 w-4" />
          {loading ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
