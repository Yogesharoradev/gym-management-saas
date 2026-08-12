import { redirect } from "next/navigation";
import { getAuthState, isGymAccessible } from "@/lib/auth/session";
import { ROLES } from "@/lib/constants";
import { GymSuspended } from "@/components/gym-suspended";

export const dynamic = "force-dynamic";

export default async function SuspendedPage() {
  const state = await getAuthState();
  if (!state) redirect("/login");
  if (state.user.role === ROLES.SUPER_ADMIN) redirect("/super-admin");
  if (!state.gym) redirect("/login");
  if (isGymAccessible(state.gym)) redirect("/dashboard");

  return <GymSuspended gym={state.gym} />;
}
