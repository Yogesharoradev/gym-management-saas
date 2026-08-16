import { type NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { requireApiGymAdmin } from "@/lib/auth/api-guard";
import { createMembershipPlan, listMembershipPlans } from "@/lib/data/memberships";
import { membershipPlanSchema } from "@/lib/validation/membership";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApiGymAdmin();
  if (!auth.ok) return auth.response;
  return jsonOk({ plans: await listMembershipPlans(auth.user.gymId as string) });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiGymAdmin();
  if (!auth.ok) return auth.response;
  let body: unknown;
  try { body = await request.json(); } catch { return jsonError("Invalid request body", 400); }
  const parsed = membershipPlanSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid plan details", 422);
  try {
    return jsonOk({ plan: await createMembershipPlan(auth.user.gymId as string, parsed.data) }, 201);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to create membership plan", 409);
  }
}
