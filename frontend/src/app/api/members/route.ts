import { type NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { requireApiGymAdmin } from "@/lib/auth/api-guard";
import { createMember, listMembers } from "@/lib/data/members";
import { memberSchema } from "@/lib/validation/member";
import { MEMBER_STATUS, type MemberStatus } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireApiGymAdmin();
  if (!auth.ok) return auth.response;

  const params = request.nextUrl.searchParams;
  const rawStatus = params.get("status");
  const status = Object.values(MEMBER_STATUS).includes(rawStatus as MemberStatus) ? rawStatus as MemberStatus : undefined;
  const page = Number(params.get("page") ?? "1");
  const pageSize = Number(params.get("pageSize") ?? "12");
  const result = await listMembers(auth.user.gymId as string, {
    query: params.get("q") ?? undefined,
    status,
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 12,
  });
  return jsonOk(result);
}

export async function POST(request: NextRequest) {
  const auth = await requireApiGymAdmin();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try { body = await request.json(); } catch { return jsonError("Invalid request body", 400); }
  const parsed = memberSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid member details", 422);

  const member = await createMember(auth.user.gymId as string, parsed.data);
  return jsonOk({ member }, 201);
}
