import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Settings as SettingsIcon,
  Users,
  CreditCard,
  Clock,
  AlertCircle,
} from "lucide-react";
import { requireGymContext } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { gym } = await requireGymContext();

  const infoRows = [
    { icon: Phone, label: "Phone", value: gym.phone || "—" },
    { icon: Mail, label: "Email", value: gym.email || "—" },
  ];

  const upcomingFeatures = [
    {
      icon: Users,
      title: "Staff Management",
      description: "Add, manage, and assign roles to your gym staff members.",
      comingSoon: true,
    },
    {
      icon: CreditCard,
      title: "Billing & Payments",
      description:
        "Configure payment gateways, invoices, and subscription plans.",
      comingSoon: true,
    },
    {
      icon: SettingsIcon,
      title: "Gym Profile",
      description: "Update your gym details, timings, and contact information.",
      comingSoon: true,
    },
    {
      icon: Clock,
      title: "Operating Hours",
      description: "Set your gym's working hours and holiday schedules.",
      comingSoon: true,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-7" data-testid="settings-page">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-cyan-50/70 p-5 shadow-[0_18px_50px_rgba(16,185,129,0.08)] sm:p-7 lg:p-8">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute -left-16 -bottom-24 h-48 w-48 rounded-full bg-cyan-300/15 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Gym Configuration
            </div>
            <h1 className="font-heading text-3xl font-black tracking-[-0.035em] text-slate-900 sm:text-4xl">
              Settings & Configuration
            </h1>
            <p className="mt-2.5 max-w-xl text-sm leading-6 text-slate-500">
              Manage your gym profile, staff, billing, and all operational
              settings in one place.
            </p>
          </div>
          <Badge
            variant="outline"
            className="h-9 rounded-full border-emerald-200 bg-emerald-50/80 px-4 text-xs font-bold text-emerald-700"
          >
            Read only
          </Badge>
        </div>
      </section>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gym Profile Card */}
        <Card className="lg:col-span-2 overflow-hidden rounded-[1.5rem] border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <CardHeader className="border-b border-slate-100 bg-slate-50/40 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    {gym.name}
                  </CardTitle>
                  <p className="text-xs text-slate-400">Gym Profile</p>
                </div>
              </div>
              <StatusBadge status={gym.subscriptionStatus} />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {infoRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-all hover:border-slate-200"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400">
                    <row.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {row.label}
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {row.value}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-all hover:border-slate-200 sm:col-span-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Gym Status
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      {gym.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Upcoming Features */}
        <Card className="overflow-hidden rounded-[1.5rem] border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <CardHeader className="border-b border-slate-100 bg-slate-50/40 px-6 py-5">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-sm font-bold text-slate-900">
                Upcoming Features
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-4">
              {upcomingFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-emerald-100 hover:bg-emerald-50/30"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-600">
                      <feature.icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-800">
                          {feature.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className="rounded-full border-amber-200 bg-amber-50 px-1.5 py-0 text-[8px] font-bold uppercase tracking-wider text-amber-600"
                        >
                          Soon
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Note */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="flex items-start gap-4 sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              More settings coming soon
            </h3>
            <p className="text-sm text-slate-500">
              Editable gym profile, staff management, billing settings, and
              operational controls will be available in an upcoming release.
            </p>
          </div>
          <Button
            variant="outline"
            className="ml-auto shrink-0 rounded-lg border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
            disabled
          >
            <Clock className="mr-1.5 h-4 w-4" />
            In Development
          </Button>
        </div>
      </div>
    </div>
  );
}
