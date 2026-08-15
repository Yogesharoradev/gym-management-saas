"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  ChevronRight,
  LogOut,
  Settings,
  User,
  ChevronDown,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GYM_NAV, SUPER_NAV, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { GymSummary, SessionUser } from "@/types";

const ROOT_HREFS = new Set(["/dashboard", "/super-admin"]);

function isActive(pathname: string, href: string): boolean {
  if (ROOT_HREFS.has(href)) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type BreadcrumbItem = { label: string; href?: string };

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [
    { label: "Dashboard", href: "/super-admin" },
  ];
  if (pathname === "/super-admin") return crumbs;
  const segments = pathname.replace("/super-admin/", "").split("/");
  segments.forEach((seg, i) => {
    const label = seg
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({
      label,
      href:
        i === segments.length - 1
          ? undefined
          : `/super-admin/${segments.slice(0, i + 1).join("/")}`,
    });
  });
  return crumbs;
}

function SidebarNav({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5 px-3" data-testid="sidebar-nav">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            data-testid={`nav-link-${item.label.toLowerCase()}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              active
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5",
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-400" />
            )}
            <item.icon
              className={cn(
                "h-[18px] w-[18px] shrink-0 transition-colors",
                active
                  ? "text-emerald-400"
                  : "text-slate-500 group-hover:text-slate-300",
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function GymFooter({ gym }: { gym: GymSummary }) {
  const statusColors: Record<string, string> = {
    active: "bg-emerald-500",
    past_due: "bg-amber-500",
    suspended: "bg-rose-500",
  };

  return (
    <div
      className="mx-3 rounded-xl border border-white/5 bg-white/[0.03] p-4"
      data-testid="sidebar-gym-info"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Current Gym
      </p>
      <p className="mt-1.5 truncate text-sm font-bold text-white tracking-tight">
        {gym.name}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${statusColors[gym.subscriptionStatus] || "bg-slate-500"}`}
        />
        <span className="text-[11px] text-slate-400 capitalize">
          {gym.subscriptionStatus.replace("_", " ")}
        </span>
      </div>
    </div>
  );
}

export function AppShell({
  variant,
  user,
  gym,
  children,
}: {
  variant: "gym" | "super";
  user: SessionUser;
  gym: GymSummary | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const items = variant === "super" ? SUPER_NAV : GYM_NAV;
  const subtitle = variant === "super" ? "Platform" : "Gym Console";
  const breadcrumbs = getBreadcrumbs(pathname);

  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user.email?.slice(0, 2).toUpperCase() ?? "U");

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      window.location.href = "/login";
    }
  }
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 lg:grid lg:grid-cols-[16.5rem_1fr]">
      {/* ─── Dark Sidebar ─── */}
      <aside className="sticky top-0 hidden h-screen flex-col bg-slate-900 lg:flex">
        {/* Brand */}
        <div className="flex h-16 items-center px-6 border-b border-white/5">
          <Brand
            subtitle={subtitle}
            className="[&_span]:text-white"
            subtitleClassName="text-slate-400"
          />
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-3">
          <p className="px-6 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Menu
          </p>
          <SidebarNav items={items} pathname={pathname} />
        </div>

        {/* Gym Footer */}
        {variant === "gym" && gym ? (
          <div className="p-3 pt-0 pb-4">
            <GymFooter gym={gym} />
          </div>
        ) : null}

        {/* ─── User Footer ─── */}
        <div className="border-t border-white/5 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5">
                <Avatar className="h-8 w-8 border border-white/10">
                  <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {user.name || user.email} sncadj
                  </p>
                  <p className="truncate text-xs text-slate-500 capitalize">
                    {user.role.replace("_", " ")}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-600 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            {/* ─── FIX: Explicit dark dropdown styling ─── */}
            <DropdownMenuContent
              align="end"
              side="top"
              sideOffset={8}
              className="w-56 bg-slate-800 border-slate-700 text-slate-200 shadow-2xl shadow-black/50 z-9999"
            >
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-300 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ─── Main Column ─── */}
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/70 px-4 backdrop-blur-xl md:px-8">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9"
                aria-label="Open navigation"
                data-testid="mobile-nav-trigger"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-80 p-0 bg-slate-900 border-white/5"
            >
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-16 items-center border-b border-white/5 px-6">
                <Brand
                  subtitle={subtitle}
                  className="[&_span]:text-white"
                  subtitleClassName="text-slate-500"
                />
              </div>
              <div className="p-4">
                <SidebarNav
                  items={items}
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
                {variant === "gym" && gym ? (
                  <div className="mt-4">
                    <GymFooter gym={gym} />
                  </div>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>

          {/* Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={crumb.label}>
                {i > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Mobile title */}
          <h1 className="md:hidden truncate font-heading text-base font-bold tracking-tight">
            {breadcrumbs[breadcrumbs.length - 1]?.label}
          </h1>

          {/* Sign out only */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            >
              <LogOut className="mr-1.5 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
