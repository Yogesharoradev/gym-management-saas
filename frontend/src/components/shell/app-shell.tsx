"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronRight, LogOut, ChevronDown } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GYM_NAV, SUPER_NAV, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { GymSummary, SessionUser } from "@/types";
import { useLogout } from "@/lib/hooks/useLogout";

const ROOT_HREFS = new Set(["/dashboard", "/super-admin"]);

function isActive(pathname: string, href: string): boolean {
  if (ROOT_HREFS.has(href)) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type BreadcrumbItem = { label: string; href?: string };

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [{ label: "Dashboard", href: "/super-admin" }];
  if (pathname === "/super-admin") return crumbs;
  const segments = pathname.replace("/super-admin/", "").split("/");
  segments.forEach((seg, i) => {
    const label = seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, href: i === segments.length - 1 ? undefined : `/super-admin/${segments.slice(0, i + 1).join("/")}` });
  });
  return crumbs;
}

function SidebarNav({ items, pathname, onNavigate }: { items: NavItem[]; pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5 px-3" data-testid="sidebar-nav">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate} data-testid={`nav-link-${item.label.toLowerCase()}`} aria-current={active ? "page" : undefined} className={cn("group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200", active ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5")}>
            {active ? <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-400" /> : null}
            <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", active ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function GymFooter({ gym }: { gym: GymSummary }) {
  const statusColors: Record<string, string> = { active: "bg-emerald-500", past_due: "bg-amber-500", suspended: "bg-rose-500" };
  return (
    <div className="mx-3 rounded-xl border border-white/5 bg-white/[0.03] p-4" data-testid="sidebar-gym-info">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Current Gym</p>
      <p className="mt-1.5 truncate text-sm font-bold tracking-tight text-white">{gym.name}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${statusColors[gym.subscriptionStatus] || "bg-slate-500"}`} />
        <span className="text-[11px] capitalize text-slate-400">{gym.subscriptionStatus.replace("_", " ")}</span>
      </div>
    </div>
  );
}

export function AppShell({ variant, user, gym, children }: { variant: "gym" | "super"; user: SessionUser; gym: GymSummary | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const items = variant === "super" ? SUPER_NAV : GYM_NAV;
  const subtitle = variant === "super" ? "Platform" : "Gym Console";
  const breadcrumbs = getBreadcrumbs(pathname);
  const userInitials = user.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : (user.email?.slice(0, 2).toUpperCase() ?? "U");
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 lg:grid lg:grid-cols-[16.5rem_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col bg-slate-900 lg:flex">
        <div className="flex h-16 items-center border-b border-white/5 px-6"><Brand subtitle={subtitle} className="[&_span]:text-white" subtitleClassName="text-slate-400" /></div>
        <div className="flex-1 overflow-y-auto py-3">
          <p className="px-6 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Menu</p>
          <SidebarNav items={items} pathname={pathname} />
        </div>
        {variant === "gym" && gym ? <div className="p-3 pt-0 pb-4"><GymFooter gym={gym} /></div> : null}
        <div className="border-t border-white/5 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5">
                <Avatar className="h-8 w-8 border border-white/10"><AvatarFallback className="bg-emerald-500/20 text-xs font-bold text-emerald-400">{userInitials}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-200">{user.name || user.email}</p><p className="truncate text-xs capitalize text-slate-500">{user.role.replace("_", " ")}</p></div>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" sideOffset={8} className="z-[9999] w-56 border-slate-700 bg-slate-800 text-slate-200 shadow-2xl shadow-black/50">
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem className="cursor-pointer text-rose-400 focus:bg-rose-500/10 focus:text-rose-300" onClick={logout}><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/60 bg-white/70 px-4 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/70 md:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden" aria-label="Open navigation" data-testid="mobile-nav-trigger"><Menu className="h-5 w-5" /></Button></SheetTrigger>
            <SheetContent side="left" className="w-80 border-white/5 bg-slate-900 p-0"><SheetTitle className="sr-only">Navigation</SheetTitle><div className="flex h-16 items-center border-b border-white/5 px-6"><Brand subtitle={subtitle} className="[&_span]:text-white" subtitleClassName="text-slate-500" /></div><div className="p-4"><SidebarNav items={items} pathname={pathname} onNavigate={() => setMobileOpen(false)} />{variant === "gym" && gym ? <div className="mt-4"><GymFooter gym={gym} /></div> : null}</div></SheetContent>
          </Sheet>
          <nav className="hidden items-center gap-1.5 text-sm md:flex">
            {breadcrumbs.map((crumb, i) => <React.Fragment key={crumb.label}>{i > 0 ? <ChevronRight className="h-3.5 w-3.5 text-slate-400" /> : null}{crumb.href ? <Link href={crumb.href} className="text-slate-500 transition-colors hover:text-slate-800 dark:hover:text-slate-200">{crumb.label}</Link> : <span className="font-semibold text-slate-900 dark:text-slate-100">{crumb.label}</span>}</React.Fragment>)}
          </nav>
          <h1 className="truncate font-heading text-base font-bold tracking-tight md:hidden">{breadcrumbs[breadcrumbs.length - 1]?.label}</h1>
          <div className="ml-auto flex items-center gap-2"><Button variant="ghost" size="sm" onClick={logout} className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"><LogOut className="mr-1.5 h-4 w-4" />Sign out</Button></div>
        </header>
        <main className="flex-1 p-4 md:p-8"><div className="mx-auto w-full max-w-7xl animate-fade-in">{children}</div></main>
      </div>
    </div>
  );
}
