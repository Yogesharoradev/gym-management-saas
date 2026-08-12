import { CheckCircle2, AlertTriangle, Ban, XCircle, Info } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { getPlatformOverview } from "@/lib/data/platform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SAMPLE_ARPA = 2999;

export default async function SuperAdminSubscriptionsPage() {
  await requireSuperAdmin();
  const overview = await getPlatformOverview();
  const sampleMrr = overview.activeGyms * SAMPLE_ARPA;

  const breakdown = [
    { status: "ACTIVE", count: overview.activeGyms },
    { status: "PAST_DUE", count: overview.pastDueGyms },
    { status: "SUSPENDED", count: overview.suspendedGyms },
    { status: "CANCELLED", count: overview.cancelledGyms },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="overline">Platform</p>
        <h2 className="mt-1 font-heading text-2xl font-black tracking-tighter">
          Subscriptions
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard testId="sub-active" label="Active" value={String(overview.activeGyms)} helper="Paying gyms" icon={CheckCircle2} accent />
        <StatCard testId="sub-past-due" label="Past Due" value={String(overview.pastDueGyms)} helper="Payment overdue" icon={AlertTriangle} />
        <StatCard testId="sub-suspended" label="Suspended" value={String(overview.suspendedGyms)} helper="Access paused" icon={Ban} />
        <StatCard testId="sub-cancelled" label="Cancelled" value={String(overview.cancelledGyms)} helper="Churned gyms" icon={XCircle} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {breakdown.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between rounded-sm border border-border px-4 py-3"
                data-testid={`subscription-breakdown-${item.status.toLowerCase()}`}
              >
                <StatusBadge status={item.status} />
                <span className="font-heading text-lg font-bold tracking-tight">
                  {item.count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>MRR</CardTitle>
            <Badge variant="muted">Sample</Badge>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-black tracking-tighter">
              {formatCurrencyINR(sampleMrr)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Estimated from {overview.activeGyms} active gyms at a sample rate.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 rounded-sm border border-dashed border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5" />
        Subscription billing, invoices and plan management are not implemented yet.
        These figures are foundational placeholders.
      </div>
    </div>
  );
}
