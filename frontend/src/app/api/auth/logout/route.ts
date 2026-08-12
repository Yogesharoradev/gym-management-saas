import { clearSessionCookie } from "@/lib/auth/session";
import { jsonOk } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  clearSessionCookie();
  return jsonOk({ success: true });
}
