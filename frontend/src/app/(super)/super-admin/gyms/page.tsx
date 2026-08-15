import { Building2, Plus, Info } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { getPlatformOverview } from "@/lib/data/platform";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GymsClientView } from "./_components/gyms-client-view";

export const dynamic = "force-dynamic";

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
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm shadow-violet-200 dark:shadow-none">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Platform Management
            </span>
          </div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Gyms
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Manage and monitor all gyms on your platform.
          </p>
        </div>
        <Link href="/super-admin/gyms/new">
          <Button
            size="sm"
            className="h-9 text-xs flex items-center bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow-md hover:shadow-violet-500/20 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Gym
          </Button>
        </Link>
      </div>

      <GymsClientView
        overview={overview}
        activeCount={activeCount}
        suspendedCount={suspendedCount}
      />
    </div>
  );
}
