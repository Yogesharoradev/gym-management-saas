import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Dumbbell,
  ArrowRight,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { getSessionPayload } from "@/lib/auth/session";
import { ROLES } from "@/lib/constants";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

const LOGIN_BG =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwzfHxneW0lMjBkYXJrJTIwbW9kZXJufGVufDB8fHx8MTc0MDAwMDAwMHww&ixlib=rb-4.1.0&q=85";

const stats = [
  {
    icon: Users,
    label: "Active Members",
    value: "12,000+",
    color: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    icon: TrendingUp,
    label: "Revenue Tracked",
    value: "₹8.5Cr+",
    color: "from-amber-500/20 to-amber-500/5",
  },
  {
    icon: Dumbbell,
    label: "Gyms Powered",
    value: "350+",
    color: "from-rose-500/20 to-rose-500/5",
  },
];

export default async function LoginPage() {
  const payload = await getSessionPayload();
  if (payload) {
    redirect(
      payload.role === ROLES.SUPER_ADMIN ? "/super-admin" : "/dashboard",
    );
  }

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* ─── Visual Panel ─── */}
      <div className="relative hidden overflow-hidden bg-neutral-950 lg:block">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${LOGIN_BG})` }}
          aria-hidden
        />

        {/* Multi-layer overlay for depth */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />

        {/* Subtle animated grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative flex h-full flex-col justify-between p-12">
          {/* Top: Brand */}
          <div className="animate-fade-in-down">
            <Brand subtitle="Platform" className="[&_span]:text-white" />
          </div>

          {/* Middle: Hero text */}
          <div className="max-w-lg animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Trusted by 350+ gyms across India
            </div>

            <h2 className="mt-6 font-heading text-5xl font-black leading-[1.1] tracking-tight text-white">
              Run your gym
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                like a pro.
              </span>
            </h2>

            <p className="mt-5 text-base leading-relaxed text-white/60 max-w-md">
              Members, memberships, attendance, payments and renewals — one
              clean, blazing-fast console built exclusively for Indian gyms.
            </p>

            <div className="mt-8 flex items-center gap-3 text-sm text-white/50">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <ArrowRight className="h-4 w-4" />
              </span>
              <span>Start your 14-day free trial today</span>
            </div>
          </div>

          {/* Bottom: Floating stats cards */}
          <div
            className="grid grid-cols-3 gap-4 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1"
                style={{ animationDelay: `${0.4 + i * 0.1}s` }}
              >
                <div
                  className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${stat.color} blur-2xl transition-all duration-500 group-hover:scale-150`}
                />
                <stat.icon className="relative h-5 w-5 text-white/70" />
                <p className="relative mt-3 text-2xl font-bold text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="relative mt-1 text-xs font-medium text-white/40">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Form Panel ─── */}
      <div className="relative flex items-center justify-center bg-neutral-50 px-6 py-12 dark:bg-neutral-950">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-10 lg:hidden">
            <Brand subtitle="Platform" />
          </div>

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
              Welcome back
            </p>
            <h1 className="mt-3 font-heading text-4xl font-black tracking-tight text-foreground">
              Sign in to <span className="text-primary">GymOS</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Enter your credentials to access your gym management console.
            </p>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-border/50 bg-card p-1 shadow-xl shadow-black/5">
            <div className="rounded-xl bg-card p-6 sm:p-8">
              <Suspense fallback={null}>
                <LoginForm />
              </Suspense>
            </div>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-dashed border-border/60 bg-muted/30">
            <div className="flex items-center gap-3 border-b border-dashed border-border/60 bg-muted/50 px-5 py-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground">
                Demo Accounts
              </span>
            </div>
            <div className="space-y-2.5 p-5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gym Admin</span>
                <code className="rounded-md bg-muted px-2 py-1 font-mono text-foreground">
                  admin@ironpulse.in
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Password</span>
                <code className="rounded-md bg-muted px-2 py-1 font-mono text-foreground">
                  GymAdmin@123
                </code>
              </div>
              <div className="my-2 border-t border-dashed border-border/40" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Super Admin</span>
                <code className="rounded-md bg-muted px-2 py-1 font-mono text-foreground">
                  owner@gymos.app
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Password</span>
                <code className="rounded-md bg-muted px-2 py-1 font-mono text-foreground">
                  SuperAdmin@123
                </code>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-muted-foreground/60">
            By signing in, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
