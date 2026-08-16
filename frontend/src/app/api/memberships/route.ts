import { type NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { requireApiGymAdmin } from "@/lib/auth/api-guard";
import { createMembership, listMemberships } from "@/lib/data/memberships";
import { membershipSchema } from "@/lib/validation/membership";
import { MEMBERSHIP_STATUS, type MembershipStatus } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireApiGymAdmin();
  if (!auth.ok) return auth.response;
  const params = request.nextUrl.searchParams;
  const rawStatus = params.get("status");
  const status = Object.values(MEMBERSHIP_STATUS).includes(rawStatus as MembershipStatus) ? rawStatus as MembershipStatus : undefined;
  const page = Number(params.get("page") ?? "1");
  const pageSize = Number(params.get("pageSize") ?? "12");
  return jsonOk(await listMemberships(auth.user.gymId as string, { query: params.get("q") ?? undefined, status, page: Number.isFinite(page) ? page : 1, pageSize: Number.isFinite(pageSize) ? pageSize : 12 }));
}

export async function POST(request: NextRequest) {
  const auth = await requireApiGymAdmin();
  if (!auth.ok) return auth.response;
  let body: unknown;
  try { body = await request.json(); } catch { return jsonError("Invalid request body", 400); }
  const parsed = membershipSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid membership details", 422);
  try { return jsonOk({ membership: await createMembership(auth.user.gymId as string, parsed.data) }, 201); }
  catch (error) { return jsonError(error instanceof Error ? error.message : "Unable to create membership", 409); }
}
