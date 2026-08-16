import "server-only";
import { redirect } from "next/navigation";
import { getAuthState, isGymAccessible, type AuthState } from "@/lib/auth/session";
import { ROLES } from "@/lib/constants";
import type { GymSummary, SessionUser } from "@/types";

export async function requireAuth(): Promise<AuthState> {
  const state = await getAuthState();
  if (!state) redirect("/login");
  return state;
}

export async function requireSuperAdmin(): Promise<{ user: SessionUser }> {
  const state = await requireAuth();
  if (state.user.role !== ROLES.SUPER_ADMIN) redirect("/dashboard");
  return { user: state.user };
}

export async function requireGymContext(): Promise<{
  user: SessionUser;
  gym: GymSummary;
}> {
  const state = await requireAuth();
  if (state.user.role === ROLES.SUPER_ADMIN) redirect("/super-admin");
  if (!state.gym || !state.user.gymId) redirect("/login");
  if (state.user.mustChangePassword) redirect("/change-password");
  if (!isGymAccessible(state.gym)) redirect("/suspended");
  return { user: state.user, gym: state.gym };
}

export { isGymAccessible };
