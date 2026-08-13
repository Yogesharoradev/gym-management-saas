import { type NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { requireApiSuperAdmin } from "@/lib/auth/api-guard";
import { createGymSchema } from "@/lib/validation/gym";
import { createGymWithAdmin, listGyms } from "@/lib/data/gyms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApiSuperAdmin();
  if (!auth.ok) return auth.response;

  const gyms = await listGyms();
  return jsonOk({ gyms });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSuperAdmin();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = createGymSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
  }

  const result = await createGymWithAdmin(parsed.data);
  if (!result.ok) {
    return jsonError("A user with this admin email already exists", 409);
  }

  return jsonOk({ gym: result.gym, admin: result.admin }, 201);
}
