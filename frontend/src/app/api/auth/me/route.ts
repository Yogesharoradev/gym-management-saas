import { getAuthState } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getAuthState();
  if (!state) {
    return jsonError("Not authenticated", 401);
  }
  return jsonOk(state);
}
