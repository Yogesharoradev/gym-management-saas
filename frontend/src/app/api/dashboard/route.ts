import { type NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { requireApiGymAdmin } from "@/lib/auth/api-guard";
import { getGymAccessInfo } from "@/lib/auth/session";
import { getGymDashboardData } from "@/lib/data/dashboard";

export const runtime = "nodejs";

export async function GET(_request: NextRequest) {
  try {
    const auth = await requireApiGymAdmin();
    if (!auth.ok) return auth.response;

    const gymId = auth.user.gymId as string;
    const { gym } = auth;
    const [dashboard] = await Promise.all([getGymDashboardData(gymId)]);
    const access = getGymAccessInfo(gym);

    return jsonOk({
      dashboard,
      user: { name: auth.user.name },
      gym: {
        name: gym.name,
        subscriptionEndDate: gym.subscriptionEndDate ?? null,
      },
      access: {
        inGracePeriod: access.inGracePeriod,
        graceDaysRemaining: access.graceDaysRemaining,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard failed", error);
    return jsonError(
      error instanceof Error ? error.message : "Unable to load dashboard",
      500,
    );
  }
}
