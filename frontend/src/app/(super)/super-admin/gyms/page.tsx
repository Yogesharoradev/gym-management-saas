import {
  Building2,
  Search,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  MoreHorizontal,
  Filter,
  Plus,
  Ban,
  AlertTriangle,
  Info,
} from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { getPlatformOverview } from "@/lib/data/platform";
import { EmptyState } from "@/components/empty-state";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

function GymStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { classes: string; label: string }> = {
    active: {
      classes:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
      label: "Active",
    },
    inactive: {
      classes:
        "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
      label: "Inactive",
    },
    suspended: {
      classes:
        "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",
      label: "Suspended",
    },
  };

  const config = configs[status] || {
    classes:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    label: status,
  };

  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-semibold capitalize ${config.classes}`}
    >
      {config.label}
    </Badge>
  );
}

function SubscriptionStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { classes: string; label: string }> = {
    active: {
      classes:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
      label: "Active",
    },
    past_due: {
      classes:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
      label: "Past Due",
    },
    suspended: {
      classes:
        "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",
      label: "Suspended",
    },
    cancelled: {
      classes:
        "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
      label: "Cancelled",
    },
  };

  const config = configs[status] || {
    classes:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    label: status.replace("_", " "),
  };

  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-semibold capitalize ${config.classes}`}
    >
      {config.label}
    </Badge>
  );
}

export default async function SuperAdminGymsPage() {
  await requireSuperAdmin();
  const overview = await getPlatformOverview();

  const activeCount = overview.gyms.filter(
    (g: any) => g.status === "Active",
  ).length;
  const suspendedCount = overview.gyms.filter(
    (g: any) => g.status === ("suspended" as const),
  ).length;

  return (
    <div className="space-y-8">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Platform
            </span>
          </div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Gyms
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Manage and monitor all gyms on your platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs border-slate-200 dark:border-slate-700"
          >
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            Filter
          </Button>
          <Link href="/super-admin/gyms/new">
            <Button size="sm" className="h-9 text-xs flex items-center">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Gym
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Quick Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Gyms",
            value: overview.totalGyms,
            icon: Building2,
            color: "bg-emerald-500",
          },
          {
            label: "Active",
            value: activeCount,
            icon: Users,
            color: "bg-emerald-500",
          },
          {
            label: "Suspended",
            value: suspendedCount,
            icon: Ban,
            color: "bg-rose-500",
          },
          {
            label: "Past Due",
            value: overview.pastDueGyms,
            icon: AlertTriangle,
            color: "bg-amber-500",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 overflow-hidden"
          >
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 ${stat.color}`}
            />
            <CardContent className="p-4 pl-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <stat.icon className="h-5 w-5 text-slate-300 dark:text-slate-600" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Gyms Table ─── */}
      <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-5 pt-6 px-6">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              All Gyms
            </CardTitle>
            <CardDescription className="text-xs mt-1 text-slate-500 dark:text-slate-400">
              {overview.totalGyms} gyms registered on the platform
            </CardDescription>
          </div>
          <div className="relative w-64 hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search gyms..."
              className="h-9 pl-9 text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {overview.gyms.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Building2}
                title="No gyms yet"
                description="Once gyms are onboarded, you'll be able to view and manage them here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-6 w-[30%]">
                      Gym
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Contact
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Gym Status
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Subscription
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Joined
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pr-6 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.gyms.map((gym) => (
                    <TableRow
                      key={gym.id}
                      data-testid={`gym-row-${gym.id}`}
                      className="group border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                            <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold">
                              {gym.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                              {gym.name}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {gym.email || "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          {gym.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                              <Phone className="h-3 w-3" />
                              {gym.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <GymStatusBadge status={gym.status} />
                      </TableCell>
                      <TableCell className="py-4">
                        <SubscriptionStatusBadge
                          status={gym.subscriptionStatus}
                        />
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(gym.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-slate-600"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Footer Note ─── */}
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-5 py-4 text-xs">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Coming Soon
          </p>
          <p className="mt-1 text-slate-500 dark:text-slate-500 leading-relaxed">
            Suspend / reactivate controls and gym detail views arrive with the
            platform management module. Suspending a gym never deletes its
            business data.
          </p>
        </div>
      </div>
    </div>
  );
}
