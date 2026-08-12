import { Info, Clock, ArrowUpRight } from "lucide-react";
import { requireGymContext } from "@/lib/auth/guards";
import { StatCard } from "@/components/stat-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  dashboardStats,
  revenueSeries,
  expiringMembers,
  IS_MOCK_DATA,
} from "@/lib/mock/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { gym } = await requireGymContext();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <p className="overline">{gym.name}</p>
        <h2 className="font-heading text-2xl font-black tracking-tighter">
          Dashboard
        </h2>
      </div>

      {IS_MOCK_DATA ? (
        <div
          className="flex items-center gap-2 rounded-sm border border-dashed border-border bg-surface px-3 py-2 text-xs text-muted-foreground"
          data-testid="mock-data-banner"
        >
          <Info className="h-3.5 w-3.5" />
          Showing sample placeholder data. Live metrics arrive with the Members &amp;
          Payments modules.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.key}
            testId={`stat-${stat.key}`}
            label={stat.label}
            value={stat.value}
            helper={stat.helper}
            icon={stat.icon}
            accent={stat.accent}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Revenue</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Last 7 days</p>
            </div>
            <Badge variant="muted">Sample</Badge>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueSeries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {expiringMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-sm border border-border px-3 py-2.5 transition-colors hover:border-foreground/30"
                data-testid={`expiring-member-${member.id}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.plan}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
                  {member.endsIn}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
