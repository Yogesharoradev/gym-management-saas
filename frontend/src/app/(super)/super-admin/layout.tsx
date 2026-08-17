import { requireSuperAdmin } from "@/lib/auth/guards";
import { SuperAdminShell } from "@/components/shell/super-admin-shell";

export const dynamic = "force-dynamic";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireSuperAdmin();

  return <SuperAdminShell user={user}>{children}</SuperAdminShell>;
}
