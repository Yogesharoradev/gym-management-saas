import { requireSuperAdmin } from "@/lib/auth/guards";
import { getPlatformOverview } from "@/lib/data/platform";
import { OverviewClientView } from "./_components/overview-client-view";

export const dynamic = "force-dynamic";

export default async function SuperAdminOverviewPage() {
  await requireSuperAdmin();
  const overview = await getPlatformOverview();
  return <OverviewClientView overview={overview} />;
}
