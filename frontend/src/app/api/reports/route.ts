import { type NextRequest } from "next/server";

import { jsonError, jsonOk } from "@/lib/api";
import { requireApiGymAdmin } from "@/lib/auth/api-guard";
import { getReportsOverview } from "@/lib/data/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireApiGymAdmin();
  if (!auth.ok) return auth.response;

  try {
    const params = request.nextUrl.searchParams;
    const report = await getReportsOverview(
      auth.user.gymId as string,
      params.get("from"),
      params.get("to"),
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
