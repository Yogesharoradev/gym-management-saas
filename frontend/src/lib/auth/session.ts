import "server-only";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { env } from "@/lib/env";
import { UserModel } from "@/models/user.model";
import { GymModel, type IGym } from "@/models/gym.model";
import {
  SESSION_MAX_AGE,
  signSessionToken,
  verifySessionToken,
  type TokenPayload,
} from "@/lib/auth/jwt";
import {
  GYM_STATUS,
  SUBSCRIPTION_STATUS,
  ROLES,
  type Role,
} from "@/lib/constants";
import type { GymSummary, SessionUser } from "@/types";

export interface AuthState {
  user: SessionUser;
  gym: GymSummary | null;
}

function toGymSummary(gym: IGym): GymSummary {
  return {
    id: gym._id.toString(),
    name: gym.name,
    logo: gym.logo,
    phone: gym.phone,
    email: gym.email,
    status: gym.status,
    subscriptionStatus: gym.subscriptionStatus,
    subscriptionEndDate: gym.subscriptionEndDate
      ? gym.subscriptionEndDate.toISOString()
      : null,
  };
}

export function isGymAccessible(gym: GymSummary | null): boolean {
  if (!gym) return false;
  if (gym.status === GYM_STATUS.SUSPENDED) return false;
  return (
    gym.subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE ||
    gym.subscriptionStatus === SUBSCRIPTION_STATUS.PAST_DUE
  );
}

export async function setSessionCookie(payload: TokenPayload): Promise<void> {
  const token = await signSessionToken(payload);
  cookies().set(env.sessionCookieName, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(): void {
  cookies().set(env.sessionCookieName, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** Reads and verifies the session cookie. No DB access. */
export async function getSessionPayload(): Promise<TokenPayload | null> {
  const token = cookies().get(env.sessionCookieName)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Resolves the authenticated user from the session, re-validating against the
 * database (existence + isActive). The gym is loaded server-side; the client
 * never supplies gymId for authorization.
 */
export async function getAuthState(): Promise<AuthState | null> {
  const payload = await getSessionPayload();
  if (!payload) return null;

  await connectToDatabase();
  const user = await UserModel.findById(payload.sub).lean<{
    _id: unknown;
    name: string;
    email: string;
    role: Role;
    isActive: boolean;
    gymId: unknown;
  }>();

  if (!user || !user.isActive) return null;

  const gymId = user.gymId ? String(user.gymId) : null;
  let gym: GymSummary | null = null;
  if (gymId) {
    const gymDoc = await GymModel.findById(gymId);
    if (gymDoc) gym = toGymSummary(gymDoc);
  }

  return {
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      gymId,
    },
    gym,
  };
}

export function isSuperAdmin(role: Role): boolean {
  return role === ROLES.SUPER_ADMIN;
}
