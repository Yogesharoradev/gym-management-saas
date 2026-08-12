import { Building2, CheckCircle2, AlertTriangle, Ban, TrendingUp, Info } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { getPlatformOverview } from "@/lib/data/platform";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrencyINR, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SAMPLE_ARPA = 2999; // placeholder average revenue per gym (billing not built yet)

export default async function SuperAdminOverviewPage() {
  await requireSuperAdmin();
  const overview = await getPlatformOverview();
  const sampleMrr = overview.activeGyms * SAMPLE_ARPA;

  return (
    <div className="space-y-6">
      <div>
        <p className="overline">Platform</p>
        <h2 className="mt-1 font-heading text-2xl font-black tracking-tighter">
          Overview
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard testId="stat-total-gyms" label="Total Gyms" value={String(overview.totalGyms)} helper="All registered gyms" icon={Building2} accent />
        <StatCard testId="stat-active-gyms" label="Active Gyms" value={String(overview.activeGyms)} helper="Active subscriptions" icon={CheckCircle2} />
        <StatCard testId="stat-past-due-gyms" label="Past Due" value={String(overview.pastDueGyms)} helper="Payment overdue" icon={AlertTriangle} />
        <StatCard testId="stat-suspended-gyms" label="Suspended" value={String(overview.suspendedGyms)} helper="Access paused" icon={Ban} />
        <StatCard testId="stat-mrr" label="MRR (Sample)" value={formatCurrencyINR(sampleMrr)} helper="Estimated, billing pending" icon={TrendingUp} />
      </div>

      <div className="flex items-center gap-2 rounded-sm border border-dashed border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5" />
        Gym counts are live. MRR is a placeholder estimate until subscription billing
        is implemented.
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Recent Gyms</CardTitle>
          <Badge variant="muted">{overview.totalGyms} total</Badge>
        </CardHeader>
        <CardContent>
          {overview.gyms.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No gyms yet"
              description="Gyms that sign up to the platform will appear here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gym</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Renews</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.gyms.slice(0, 8).map((gym) => (
                  <TableRow key={gym.id} data-testid={`gym-row-${gym.id}`}>
                    <TableCell>
                      <p className="font-semibold">{gym.name}</p>
                      <p className="text-xs text-muted-foreground">{gym.email || "—"}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={gym.subscriptionStatus} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {gym.subscriptionEndDate ? formatDate(gym.subscriptionEndDate) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(gym.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
