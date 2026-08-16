import { type NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { requireApiGymAdmin } from "@/lib/auth/api-guard";
import { setMembershipStatus } from "@/lib/data/memberships";
import { membershipStatusSchema } from "@/lib/validation/membership";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiGymAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch { return jsonError("Invalid request body", 400); }
  const parsed = membershipStatusSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid membership status", 422);
  const membership = await setMembershipStatus(auth.user.gymId as string, id, parsed.data.status);
  if (!membership) return jsonError("Membership not found", 404);
  return jsonOk({ membership });
}
