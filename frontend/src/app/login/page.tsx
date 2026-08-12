import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { getSessionPayload } from "@/lib/auth/session";
import { ROLES } from "@/lib/constants";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

const LOGIN_BG =
  "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwzfHxneW0lMjB3b3Jrb3V0JTIwZGFya3xlbnwwfHx8fDE3ODY1NTU4OTh8MA&ixlib=rb-4.1.0&q=85";

export default async function LoginPage() {
  const payload = await getSessionPayload();
  if (payload) {
    redirect(payload.role === ROLES.SUPER_ADMIN ? "/super-admin" : "/dashboard");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Visual panel */}
      <div className="relative hidden overflow-hidden bg-black lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${LOGIN_BG})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Brand subtitle="Platform" className="[&_span]:text-white" />
          <div className="max-w-md">
            <p className="overline text-white/70">Gym Management, done right</p>
            <h2 className="mt-3 font-heading text-4xl font-black leading-none tracking-tighter">
              Run your gym like a pro.
            </h2>
            <p className="mt-4 leading-relaxed text-white/70">
              Members, memberships, attendance, payments and renewals — one clean,
              fast console built for Indian gyms.
            </p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Brand subtitle="Platform" />
          </div>
          <p className="overline">Welcome back</p>
          <h1 className="mt-2 font-heading text-3xl font-black tracking-tighter">
            Sign in to GymOS
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your credentials to access your console.
          </p>

          <div className="mt-8">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>

          <div
            className="mt-8 rounded-sm border border-dashed border-border bg-surface p-4 text-xs"
            data-testid="demo-credentials"
          >
            <div className="mb-2 flex items-center gap-1.5 font-semibold text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Demo accounts
            </div>
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Gym Admin:</span>{" "}
              admin@ironpulse.in / GymAdmin@123
            </p>
            <p className="mt-1 text-muted-foreground">
              <span className="font-semibold text-foreground">Super Admin:</span>{" "}
              owner@gymos.app / SuperAdmin@123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
