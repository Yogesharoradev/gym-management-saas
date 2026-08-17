import { type NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { requireGymContext } from "@/lib/auth/guards";
import { getGymAccessInfo } from "@/lib/auth/session";
import { getGymDashboardData } from "@/lib/data/dashboard";

export const runtime = "nodejs";

export async function GET(_request: NextRequest) {
  try {
    const { user, gym } = await requireGymContext();
    const dashboard = await getGymDashboardData(gym.id);
    const access = getGymAccessInfo(gym);

    return jsonOk({
      dashboard,
      user: { name: user.name },
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
