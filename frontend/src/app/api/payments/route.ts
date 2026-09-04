import { type NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { requireApiGymAdmin } from "@/lib/auth/api-guard";
import { listFeeRecords } from "@/lib/data/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireApiGymAdmin();
  if (!auth.ok) return auth.response;

  const params = request.nextUrl.searchParams;
  const page = Number(params.get("page") ?? "1");
  const pageSize = Number(params.get("pageSize") ?? "15");

  try {
    return jsonOk(
      await listFeeRecords(auth.user.gymId as string, {
        query: params.get("q") ?? undefined,
        method: params.get("method") ?? undefined,
        from: params.get("from") ?? undefined,
        to: params.get("to") ?? undefined,
        page: Number.isFinite(page) ? page : 1,
        pageSize: Number.isFinite(pageSize) ? pageSize : 15,
      }),
    );
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to load fee records",
      500,
    );
  }
}
