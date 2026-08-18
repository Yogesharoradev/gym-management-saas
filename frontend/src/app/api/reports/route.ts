import { type NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { requireGymContext } from "@/lib/auth/guards";
import { getReportsOverview } from "@/lib/data/reports";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { gym } = await requireGymContext();
    const { searchParams } = new URL(request.url);
    const report = await getReportsOverview(
      gym.id,
      searchParams.get("from"),
      searchParams.get("to"),
    );
    return jsonOk({ report });
  } catch (error) {
    console.error("GET /api/reports failed", error);
    return jsonError(
      error instanceof Error ? error.message : "Unable to load reports",
      500,
    );
  }
}
