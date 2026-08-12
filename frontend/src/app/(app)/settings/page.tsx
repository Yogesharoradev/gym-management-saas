import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { requireGymContext } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { gym } = await requireGymContext();

  const rows = [
    { icon: Phone, label: "Phone", value: gym.phone || "—" },
    { icon: Mail, label: "Email", value: gym.email || "—" },
  ];

  return (
    <div className="space-y-6" data-testid="settings-page">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="overline">Module</p>
          <h2 className="mt-1 font-heading text-2xl font-black tracking-tighter">
            Settings
          </h2>
        </div>
        <Badge variant="muted">Read only</Badge>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-surface text-muted-foreground">
              <Building2 className="h-5 w-5" />
            </span>
            <CardTitle>{gym.name}</CardTitle>
          </div>
          <StatusBadge status={gym.subscriptionStatus} />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground">
                <row.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="overline">{row.label}</p>
                <p className="text-sm font-medium">{row.value}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 sm:col-span-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <p className="overline">Gym Status</p>
              <p className="text-sm font-medium">{gym.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Editable gym profile, staff management and billing settings arrive in an
        upcoming release.
      </p>
    </div>
  );
}
