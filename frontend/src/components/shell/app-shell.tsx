"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/shell/user-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GYM_NAV, SUPER_NAV, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { GymSummary, SessionUser } from "@/types";

const ROOT_HREFS = new Set(["/dashboard", "/super-admin"]);

function isActive(pathname: string, href: string): boolean {
  if (ROOT_HREFS.has(href)) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1" data-testid="sidebar-nav">
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
              "flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors duration-150",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function GymFooter({ gym }: { gym: GymSummary }) {
  return (
    <div className="rounded-sm border border-border bg-surface p-3" data-testid="sidebar-gym-info">
      <p className="overline">Current Gym</p>
      <p className="mt-1 truncate font-heading text-sm font-bold tracking-tight">
        {gym.name}
      </p>
      <div className="mt-2">
        <StatusBadge status={gym.subscriptionStatus} />
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
  const currentLabel =
    items.find((item) => isActive(pathname, item.href))?.label ?? "Dashboard";

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-background lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Brand subtitle={subtitle} />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <NavList items={items} pathname={pathname} />
        </div>
        {variant === "gym" && gym ? (
          <div className="p-4 pt-0">
            <GymFooter gym={gym} />
          </div>
        ) : null}
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl md:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation"
                data-testid="mobile-nav-trigger"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-16 items-center border-b border-border px-5">
                <Brand subtitle={subtitle} />
              </div>
              <div className="p-4">
                <NavList
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

          <div className="min-w-0">
            <p className="overline hidden sm:block">
              {variant === "super" ? "Platform" : gym?.name ?? "Gym"}
            </p>
            <h1 className="truncate font-heading text-base font-bold tracking-tight sm:text-lg">
              {currentLabel}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Separator orientation="vertical" className="hidden h-8 sm:block" />
            <UserMenu user={user} />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
