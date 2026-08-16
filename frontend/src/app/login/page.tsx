import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ShieldCheck, TrendingUp, Users, Dumbbell, ArrowRight, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";
import { getSessionPayload } from "@/lib/auth/session";
import { ROLES } from "@/lib/constants";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

const LOGIN_BG =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwzfHxneW0lMjBkYXJrJTIwbW9kZXJufGVufDB8fHx8MTc0MDAwMDAwMHww&ixlib=rb-4.1.0&q=85";

const stats = [
  { icon: Users, label: "Active Members", value: "12,000+", color: "from-emerald-500/20 to-emerald-500/5" },
  { icon: TrendingUp, label: "Revenue Tracked", value: "₹8.5Cr+", color: "from-amber-500/20 to-amber-500/5" },
  { icon: Dumbbell, label: "Gyms Powered", value: "350+", color: "from-rose-500/20 to-rose-500/5" },
];

export default async function LoginPage() {
  const payload = await getSessionPayload();
  if (payload) {
    redirect(payload.role === ROLES.SUPER_ADMIN ? "/super-admin" : "/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(16,185,129,0.08),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(6,182,212,0.07),transparent_28%)]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1600px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${LOGIN_BG})` }} aria-hidden />
          <div className="absolute inset-0 bg-black/65" />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/30 to-emerald-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />

          <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
            <div>
              <Brand subtitle="Platform" className="[&_span]:text-white" />

              <div className="mt-20 max-w-xl xl:mt-28">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/65 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Built for modern gyms
                </div>

                <h1 className="mt-7 font-heading text-5xl font-black leading-[1.05] tracking-[-0.04em] text-white xl:text-6xl">
                  Run your gym
                  <span className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">like a pro.</span>
                </h1>

                <p className="mt-6 max-w-lg text-base leading-7 text-white/50 xl:text-lg">
                  Members, memberships, attendance, payments and renewals — one clean console built to keep your gym moving.
                </p>

                <div className="mt-8 flex items-center gap-3 text-sm text-white/50">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                  </span>
                  <span>Everything you need. Nothing you don&apos;t.</span>
                </div>
              </div>
            </div>

            <div className="grid max-w-3xl grid-cols-3 gap-3 xl:gap-4">
              {stats.map((stat, index) => (
                <div key={stat.label} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08] xl:p-5">
                  <div className={`absolute -right-5 -top-5 h-20 w-20 rounded-full bg-gradient-to-br ${stat.color} blur-2xl transition-transform duration-500 group-hover:scale-150`} />
                  <stat.icon className="relative h-4 w-4 text-white/55" />
                  <p className="relative mt-3 text-xl font-bold tracking-tight text-white xl:text-2xl">{stat.value}</p>
                  <p className="relative mt-1 text-[11px] font-medium text-white/35 xl:text-xs">{stat.label}</p>
                  <span className="absolute right-4 top-4 text-[10px] text-white/20">0{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center border-l border-white/5 bg-neutral-950/90 px-5 py-8 sm:px-8 lg:px-12">
          <div className="absolute inset-0 opacity-[0.025] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:32px_32px]" />

          <div className="relative w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <Brand subtitle="Platform" />
            </div>

            <div className="mb-7">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.06] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400/80">
                <ShieldCheck className="h-3.5 w-3.5" /> Secure access
              </div>
              <h2 className="font-heading text-4xl font-black tracking-[-0.03em] text-white">Welcome back</h2>
              <p className="mt-3 text-sm leading-6 text-white/40">Sign in to access your GymOS management console.</p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-1 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="rounded-[1.25rem] border border-white/[0.04] bg-neutral-900/60 p-6 sm:p-8">
                <Suspense fallback={null}>
                  <LoginForm />
                </Suspense>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-white/25">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Secure session · Protected access
            </div>

            <p className="mt-5 text-center text-[11px] leading-5 text-white/20">
              By signing in, you agree to our <a href="#" className="text-white/40 transition-colors hover:text-white/70">Terms</a> and <a href="#" className="text-white/40 transition-colors hover:text-white/70">Privacy Policy</a>.
            </p>
          </div>

          <div className="absolute bottom-5 left-5 flex items-center gap-2 text-[10px] text-white/15 sm:left-8 lg:left-12">
            <ArrowRight className="h-3 w-3" /> GymOS Platform
          </div>
        </section>
      </div>
    </main>
  );
}
