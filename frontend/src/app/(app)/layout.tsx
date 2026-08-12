import { requireGymContext } from "@/lib/auth/guards";
import { AppShell } from "@/components/shell/app-shell";

export const dynamic = "force-dynamic";

export default async function GymLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, gym } = await requireGymContext();

  return (
    <AppShell variant="gym" user={user} gym={gym}>
      {children}
    </AppShell>
  );
}
