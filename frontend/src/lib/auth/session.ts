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
  SUBSCRIPTION_GRACE_PERIOD_DAYS,
  SUBSCRIPTION_STATUS,
  ROLES,
  type Role,
} from "@/lib/constants";
import type { GymSummary, SessionUser } from "@/types";

export interface AuthState {
  user: SessionUser;
  gym: GymSummary | null;
}

export interface GymAccessInfo {
  accessible: boolean;
  inGracePeriod: boolean;
  gracePeriodEndsAt: string | null;
  graceDaysRemaining: number;
  reason: "ACTIVE" | "GRACE_PERIOD" | "MANUALLY_SUSPENDED" | "SUBSCRIPTION_INACTIVE" | "NO_GYM";
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

/**
 * Resolves gym access from the current gym record rather than trusting the
 * session token. Manual suspension always wins. Subscription expiry gets a
 * seven-day grace period so a customer is not locked out immediately.
 */
export function getGymAccessInfo(gym: GymSummary | null): GymAccessInfo {
  if (!gym) {
    return {
      accessible: false,
      inGracePeriod: false,
      gracePeriodEndsAt: null,
      graceDaysRemaining: 0,
      reason: "NO_GYM",
    };
  }

  if (gym.status === GYM_STATUS.SUSPENDED) {
    return {
      accessible: false,
      inGracePeriod: false,
      gracePeriodEndsAt: null,
      graceDaysRemaining: 0,
      reason: "MANUALLY_SUSPENDED",
    };
  }

  if (
    gym.subscriptionStatus !== SUBSCRIPTION_STATUS.ACTIVE &&
    gym.subscriptionStatus !== SUBSCRIPTION_STATUS.PAST_DUE
  ) {
    return {
      accessible: false,
      inGracePeriod: false,
      gracePeriodEndsAt: null,
      graceDaysRemaining: 0,
      reason: "SUBSCRIPTION_INACTIVE",
    };
  }

  if (!gym.subscriptionEndDate) {
    return {
      accessible: true,
      inGracePeriod: false,
      gracePeriodEndsAt: null,
      graceDaysRemaining: 0,
      reason: "ACTIVE",
    };
  }

  const endDate = new Date(gym.subscriptionEndDate);
  const gracePeriodEndsAt = new Date(
    endDate.getTime() + SUBSCRIPTION_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000,
  );
  const now = Date.now();

  if (now < endDate.getTime()) {
    return {
      accessible: true,
      inGracePeriod: false,
      gracePeriodEndsAt: gracePeriodEndsAt.toISOString(),
      graceDaysRemaining: SUBSCRIPTION_GRACE_PERIOD_DAYS,
      reason: "ACTIVE",
    };
  }

  if (now < gracePeriodEndsAt.getTime()) {
    const graceDaysRemaining = Math.max(
      1,
      Math.ceil((gracePeriodEndsAt.getTime() - now) / (24 * 60 * 60 * 1000)),
    );

    return {
      accessible: true,
      inGracePeriod: true,
      gracePeriodEndsAt: gracePeriodEndsAt.toISOString(),
      graceDaysRemaining,
      reason: "GRACE_PERIOD",
    };
  }

  return {
    accessible: false,
    inGracePeriod: false,
    gracePeriodEndsAt: gracePeriodEndsAt.toISOString(),
    graceDaysRemaining: 0,
    reason: "SUBSCRIPTION_INACTIVE",
  };
}

export function isGymAccessible(gym: GymSummary | null): boolean {
  return getGymAccessInfo(gym).accessible;
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
    passwordChangedAt?: Date | null;
  }>();

  if (!user || !user.isActive) return null;

  // Session invalidation: reject tokens issued before the last password change.
  // Compare at second granularity (JWT `iat` is in seconds) so a session minted
  // in the same second as the reset is not spuriously rejected.
  if (
    user.passwordChangedAt &&
    typeof payload.iat === "number" &&
    payload.iat < Math.floor(new Date(user.passwordChangedAt).getTime() / 1000)
  ) {
    return null;
  }

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
