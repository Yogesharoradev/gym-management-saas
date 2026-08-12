import { Building2 } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { getPlatformOverview } from "@/lib/data/platform";
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
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SuperAdminGymsPage() {
  await requireSuperAdmin();
  const overview = await getPlatformOverview();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="overline">Platform</p>
          <h2 className="mt-1 font-heading text-2xl font-black tracking-tighter">
            Gyms
          </h2>
        </div>
        <Badge variant="muted">{overview.totalGyms} total</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Gyms</CardTitle>
        </CardHeader>
        <CardContent>
          {overview.gyms.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No gyms yet"
              description="Once gyms are onboarded, you'll be able to view and manage them here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gym</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Gym Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.gyms.map((gym) => (
                  <TableRow key={gym.id} data-testid={`gym-row-${gym.id}`}>
                    <TableCell>
                      <p className="font-semibold">{gym.name}</p>
                      <p className="text-xs text-muted-foreground">{gym.email || "—"}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {gym.phone || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={gym.status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={gym.subscriptionStatus} />
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

      <p className="text-sm text-muted-foreground">
        Suspend / reactivate controls and gym detail views arrive with the platform
        management module. Suspending a gym never deletes its business data.
      </p>
    </div>
  );
}
