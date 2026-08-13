import { type NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { requireApiSuperAdmin } from "@/lib/auth/api-guard";
import { updateGymSchema } from "@/lib/validation/gym";
import { getGymById, updateGym } from "@/lib/data/gyms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireApiSuperAdmin();
  if (!auth.ok) return auth.response;

  const gym = await getGymById(params.id);
  if (!gym) return jsonError("Gym not found", 404);
  return jsonOk({ gym });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireApiSuperAdmin();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = updateGymSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
  }

  const gym = await updateGym(params.id, parsed.data);
  if (!gym) return jsonError("Gym not found", 404);
  return jsonOk({ gym });
}
