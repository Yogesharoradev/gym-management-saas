import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { getGymById, getGymAdminByGymId } from "@/lib/data/gyms";
import { formatDate, getInitials } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Shield,
  CreditCard,
  Hash,
  Globe,
} from "lucide-react";
import { GymDetailActions } from "../_components/gym-detail-actions";

export const dynamic = "force-dynamic";

/* ─── Status Dot Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const configs: Record<
    string,
    { dot: string; bg: string; text: string; label: string }
  > = {
    ACTIVE: {
      dot: "bg-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-700 dark:text-emerald-400",
      label: "Active",
    },
    SUSPENDED: {
      dot: "bg-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      text: "text-rose-700 dark:text-rose-400",
      label: "Suspended",
    },
  };
  const config = configs[status] || {
    dot: "bg-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-400",
    label: status,
  };
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </div>
  );
}

function SubscriptionBadge({ status }: { status: string }) {
  const configs: Record<
    string,
    { dot: string; bg: string; text: string; label: string }
  > = {
    ACTIVE: {
      dot: "bg-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-700 dark:text-emerald-400",
      label: "Active",
    },
    PAST_DUE: {
      dot: "bg-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      text: "text-amber-700 dark:text-amber-400",
      label: "Past Due",
    },
    SUSPENDED: {
      dot: "bg-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      text: "text-rose-700 dark:text-rose-400",
      label: "Suspended",
    },
    CANCELLED: {
      dot: "bg-slate-400",
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-400",
      label: "Cancelled",
    },
  };
  const config = configs[status] || {
    dot: "bg-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-400",
    label: status.replace("_", " "),
  };
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </div>
  );
}

/* ─── Info Field with Icon Box ─── */
function InfoField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <Icon className="h-3.5 w-3.5 text-slate-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ─── Subscription Info Item ─── */
function SubInfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}

export default async function GymDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireSuperAdmin();
  const gym = await getGymById(params.id);
  if (!gym) notFound();

  const admin = await getGymAdminByGymId(params.id);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Back Button ─── */}
      <div className="flex items-center">
        <Link href="/super-admin/gyms">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Gyms
          </Button>
        </Link>
      </div>

      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8 shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-lg">
              <Building2 className="h-7 w-7 text-white/90" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
                  Gym Profile
                </span>
                <StatusBadge status={gym.status} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {gym.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/60">
                {gym.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {gym.email}
                  </span>
                )}
                {gym.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {gym.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <GymDetailActions
            gymId={gym.id}
            name={gym.name}
            status={gym.status}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ─── Gym Information ─── */}
        <Card className="lg:col-span-2 border border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/20">
                <Building2 className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              Gym Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoField label="Gym Name" value={gym.name} icon={Building2} />
              <InfoField
                label="Email Address"
                value={gym.email || "Not provided"}
                icon={Mail}
              />
              <InfoField
                label="Phone Number"
                value={gym.phone || "Not provided"}
                icon={Phone}
              />
              <InfoField
                label="Address"
                value={gym.address || "Not provided"}
                icon={MapPin}
              />
              <InfoField
                label="Created On"
                value={formatDate(gym.createdAt)}
                icon={Calendar}
              />
              <InfoField
                label="Last Updated"
                value={formatDate(gym.updatedAt)}
                icon={Clock}
              />
            </div>
          </CardContent>
        </Card>

        {/* ─── Subscription ─── */}
        <Card className="border border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Current Status
                  </p>
                  <div className="mt-0.5">
                    <SubscriptionBadge status={gym.subscriptionStatus} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SubInfoItem
                label="Start Date"
                value={
                  gym.subscriptionStartDate
                    ? formatDate(gym.subscriptionStartDate)
                    : "—"
                }
              />
              <SubInfoItem
                label="End Date"
                value={
                  gym.subscriptionEndDate
                    ? formatDate(gym.subscriptionEndDate)
                    : "—"
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* ─── Administrator ─── */}
        <Card className="lg:col-span-3 border border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              Gym Administrator
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {admin ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                <Avatar className="h-14 w-14 border-2 border-white dark:border-slate-700 shadow-md">
                  <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold">
                    {getInitials(admin.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {admin.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      >
                        {admin.role}
                      </Badge>
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${admin.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}
                      >
                        <span
                          className={`h-1 w-1 rounded-full ${admin.isActive ? "bg-emerald-500" : "bg-slate-400"}`}
                        />
                        {admin.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {admin.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-900 dark:text-white">
                  No administrator found
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  This gym doesn't have an assigned administrator yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
