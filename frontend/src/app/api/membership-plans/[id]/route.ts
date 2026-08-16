import { type NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { requireApiGymAdmin } from "@/lib/auth/api-guard";
import { updateMembershipPlan } from "@/lib/data/memberships";
import { updateMembershipPlanSchema } from "@/lib/validation/membership";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiGymAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch { return jsonError("Invalid request body", 400); }
  const parsed = updateMembershipPlanSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid plan details", 422);
  const plan = await updateMembershipPlan(auth.user.gymId as string, id, parsed.data);
  if (!plan) return jsonError("Membership plan not found", 404);
  return jsonOk({ plan });
}
