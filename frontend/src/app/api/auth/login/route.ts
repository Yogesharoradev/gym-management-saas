import { type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { loginSchema } from "@/lib/validation/auth";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { checkLock, clearAttempts, registerFailure } from "@/lib/auth/rate-limit";
import { UserModel } from "@/models/user.model";
import { GymModel } from "@/models/gym.model";
import { ROLES } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
  }
  const { email, password } = parsed.data;

  await connectToDatabase();

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const identifier = `${ip}:${email}`;

  const lockedMinutes = await checkLock(identifier);
  if (lockedMinutes !== null) {
    return jsonError(
      `Too many failed attempts. Try again in ${lockedMinutes} minute(s).`,
      429,
    );
  }

  const user = await UserModel.findOne({ email });
  if (!user || !user.isActive) {
    await registerFailure(identifier);
    return jsonError("Invalid email or password", 401);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await registerFailure(identifier);
    return jsonError("Invalid email or password", 401);
  }

  await clearAttempts(identifier);

  const gymId = user.gymId ? String(user.gymId) : null;
  await setSessionCookie({
    sub: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    gymId,
  });

  let gym = null;
  if (gymId) {
    const gymDoc = await GymModel.findById(gymId);
    if (gymDoc) {
      gym = {
        id: String(gymDoc._id),
        name: gymDoc.name,
        status: gymDoc.status,
        subscriptionStatus: gymDoc.subscriptionStatus,
      };
    }
  }

  const redirectTo = user.role === ROLES.SUPER_ADMIN ? "/super-admin" : "/dashboard";

  return jsonOk({
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      gymId,
    },
    gym,
    redirectTo,
  });
}
