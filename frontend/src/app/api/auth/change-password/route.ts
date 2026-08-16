import { type NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { getAuthState, setSessionCookie } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { firstLoginPasswordSchema } from "@/lib/validation/auth";
import { ROLES } from "@/lib/constants";
import { UserModel } from "@/models/user.model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const state = await getAuthState();
  if (!state) return jsonError("Authentication required", 401);
  if (state.user.role !== ROLES.GYM_ADMIN) {
    return jsonError("Only Gym Admins can use this flow", 403);
  }
  if (!state.user.mustChangePassword) {
    return jsonError("A first-login password change is not required", 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = firstLoginPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid password", 422);
  }

  const user = await UserModel.findById(state.user.id);
  if (!user || !user.isActive || user.role !== ROLES.GYM_ADMIN) {
    return jsonError("Account is unavailable", 401);
  }

  user.passwordHash = await hashPassword(parsed.data.password);
  user.mustChangePassword = false;
  user.passwordChangedAt = new Date();
  await user.save();

  await setSessionCookie({
    sub: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    gymId: user.gymId ? String(user.gymId) : null,
  });

  return jsonOk({ success: true, redirectTo: "/dashboard" });
}
