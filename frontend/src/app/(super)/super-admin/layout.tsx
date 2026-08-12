import { requireSuperAdmin } from "@/lib/auth/guards";
import { AppShell } from "@/components/shell/app-shell";

export const dynamic = "force-dynamic";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireSuperAdmin();

  return (
    <AppShell variant="super" user={user} gym={null}>
      {children}
    </AppShell>
  );
}
