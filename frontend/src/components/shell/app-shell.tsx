"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Home, LogOut, Menu } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useLogout } from "@/lib/hooks/useLogout";

const ROOT_HREFS = new Set(["/dashboard", "/super-admin"]);
type BreadcrumbItem = { label: string; href?: string };

function isActive(pathname: string, href: string): boolean {
  if (ROOT_HREFS.has(href)) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function formatSegment(segment: string): string {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getBreadcrumbs(
  pathname: string,
  variant: "gym" | "super",
): BreadcrumbItem[] {
  const root = variant === "super" ? "/super-admin" : "/dashboard";
  if (pathname === root) return [{ label: "Dashboard" }];
  const prefix = variant === "super" ? "/super-admin/" : "/";
  const rawPath = pathname.startsWith(prefix)
    ? pathname.slice(prefix.length)
    : pathname.replace(/^\//, "");
  const segments = rawPath.split("/").filter(Boolean);
  const crumbs: BreadcrumbItem[] = [{ label: "Dashboard", href: root }];
  let currentPath = root;
  segments.forEach((segment, index) => {
    currentPath = `${currentPath}/${segment}`;
    const isLast = index === segments.length - 1;
    const looksLikeId =
      /^[a-f0-9]{16,}$/i.test(segment) || /^[0-9]+$/.test(segment);
    crumbs.push({
      label: looksLikeId ? "Details" : formatSegment(segment),
      href: isLast ? undefined : currentPath,
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
    <nav className="space-y-1" data-testid="sidebar-nav">
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
              "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-200",
              active
                ? "bg-emerald-400/12 text-white shadow-[inset_0_0_0_1px_rgba(52,211,153,0.08)]"
                : "text-slate-400 hover:bg-white/[0.045] hover:text-slate-100",
            )}
          >
            {active ? (
              <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-400" />
            ) : null}
            <item.icon
              className={cn(
                "h-[18px] w-[18px] shrink-0 transition-colors",
                active
                  ? "text-emerald-400"
                  : "text-slate-500 group-hover:text-slate-300",
              )}
              strokeWidth={active ? 2.2 : 1.9}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function NavSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="mb-2 px-3.5 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
        {label}
      </p>
      {children}
    </section>
  );
}

function GymSwitcher({ gym }: { gym: GymSummary }) {
  const statusLabel =
    gym.subscriptionStatus === "PAST_DUE" ? "Payment due" : "Active";
  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 shadow-lg shadow-black/10"
      data-testid="sidebar-gym-info"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/15">
          {gym.logo ? (
            <img
              src={gym.logo}
              alt=""
              className="h-10 w-10 rounded-xl object-cover"
            />
          ) : (
            <span className="text-sm font-bold">
              {gym.name.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold text-white">
            {gym.name}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                gym.subscriptionStatus === "PAST_DUE"
                  ? "bg-amber-400"
                  : "bg-emerald-400",
              )}
            />
            <span className="text-[10px] font-medium text-slate-400">
              {statusLabel}
            </span>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-600" />
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
  const subtitle =
    variant === "super" ? "Management Platform" : "Gym Management Platform";
  const breadcrumbs = getBreadcrumbs(pathname, variant);
  const logout = useLogout();
  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user.email?.slice(0, 2).toUpperCase() ?? "U");

  const navigation = (
    <div className="space-y-7">
      <NavSection label="Main">
        <SidebarNav
          items={items.filter(
            (item) => !["Announcements", "Settings"].includes(item.label),
          )}
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />
      </NavSection>
      {items.some((item) => ["Announcements"].includes(item.label)) ? (
        <NavSection label="Communication">
          <SidebarNav
            items={items.filter((item) =>
              ["Announcements"].includes(item.label),
            )}
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />
        </NavSection>
      ) : null}
      {items.some((item) => item.label === "Settings") ? (
        <NavSection label="Settings">
          <SidebarNav
            items={items.filter((item) => item.label === "Settings")}
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />
        </NavSection>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-slate-900 lg:grid lg:grid-cols-[17.5rem_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col overflow-hidden bg-[#101a2b] lg:flex">
        <div className="border-b border-white/[0.06] px-5 py-5">
          <Brand subtitle={subtitle} />
        </div>
        <div className="flex-1 overflow-y-auto px-3.5 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {variant === "gym" && gym ? (
            <div className="mb-7">
              <GymSwitcher gym={gym} />
            </div>
          ) : null}
          {navigation}
        </div>
        <div className="border-t border-white/[0.06] p-3.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-white/[0.045]">
                <Avatar className="h-9 w-9 shrink-0 ring-1 ring-white/10">
                  <AvatarFallback className="bg-emerald-400/15 text-xs font-bold text-emerald-300">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-slate-100">
                    {user.name || user.email}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] capitalize text-slate-500">
                    {user.role.replace("_", " ")}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="top"
              sideOffset={8}
              className="z-[9999] w-56 rounded-xl border-slate-700 bg-slate-900 text-slate-200 shadow-2xl shadow-black/40"
            >
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="cursor-pointer rounded-lg text-rose-400 focus:bg-rose-500/10 focus:text-rose-300"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-slate-200/80 bg-white/85 px-4 shadow-[0_1px_10px_rgba(15,23,42,0.03)] backdrop-blur-xl sm:gap-4 sm:px-6 lg:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label="Open navigation"
                data-testid="mobile-nav-trigger"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[min(86vw,340px)] border-white/10 bg-[#101a2b] p-0 text-white"
            >
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="border-b border-white/[0.06] px-5 py-5">
                <Brand subtitle={subtitle} />
              </div>
              <div className="overflow-y-auto p-4">
                {variant === "gym" && gym ? (
                  <div className="mb-6">
                    <GymSwitcher gym={gym} />
                  </div>
                ) : null}
                {navigation}
              </div>
            </SheetContent>
          </Sheet>
          <nav
            className="flex min-w-0 items-center gap-1.5 text-sm"
            aria-label="Breadcrumb"
          >
            <Link
              href={variant === "super" ? "/super-admin" : "/dashboard"}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
            >
              <Home className="h-4 w-4" />
            </Link>
            {breadcrumbs.slice(1).map((crumb, index) => (
              <React.Fragment key={`${crumb.label}-${index}`}>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hidden max-w-[180px] truncate text-xs font-medium text-slate-400 hover:text-slate-700 sm:block"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="max-w-[190px] truncate rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
            {breadcrumbs.length === 1 ? (
              <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800">
                Dashboard
              </span>
            ) : null}
          </nav>
          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl px-1.5 py-1.5 transition-colors hover:bg-slate-50">
                  <Avatar className="h-9 w-9 ring-1 ring-slate-200">
                    <AvatarFallback className="bg-emerald-600 text-xs font-bold text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden min-w-0 text-left lg:block">
                    <p className="max-w-28 truncate text-xs font-semibold text-slate-800">
                      {user.name || user.email}
                    </p>
                    <p className="mt-0.5 text-[10px] capitalize text-slate-400">
                      {user.role.replace("_", " ")}
                    </p>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-slate-400 lg:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 rounded-xl border-slate-200 bg-white p-1.5 shadow-xl"
              >
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-rose-500 focus:bg-rose-50 focus:text-rose-600"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-5 md:p-7 lg:p-8">
          <div className="mx-auto w-full max-w-[1440px] animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
