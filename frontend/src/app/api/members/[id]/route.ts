import { type NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { requireApiGymAdmin } from "@/lib/auth/api-guard";
import { getMemberById, setMemberStatus, updateMember } from "@/lib/data/members";
import { memberStatusSchema, updateMemberSchema } from "@/lib/validation/member";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireApiGymAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const member = await getMemberById(auth.user.gymId as string, id);
  if (!member) return jsonError("Member not found", 404);
  return jsonOk({ member });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireApiGymAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch { return jsonError("Invalid request body", 400); }

  if (typeof body === "object" && body !== null && "status" in body && Object.keys(body).length === 1) {
    const statusParsed = memberStatusSchema.safeParse(body);
    if (!statusParsed.success) return jsonError(statusParsed.error.issues[0]?.message ?? "Invalid status", 422);
    const member = await setMemberStatus(auth.user.gymId as string, id, statusParsed.data.status);
    if (!member) return jsonError("Member not found", 404);
    return jsonOk({ member });
  }

  const parsed = updateMemberSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid member details", 422);
  const member = await updateMember(auth.user.gymId as string, id, parsed.data);
  if (!member) return jsonError("Member not found", 404);
  return jsonOk({ member });
}
