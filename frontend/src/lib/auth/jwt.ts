import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/lib/constants";

export interface TokenPayload {
  sub: string;
  name: string;
  email: string;
  role: Role;
  gymId: string | null;
}

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing required environment variable: JWT_SECRET");
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({
    name: payload.name,
    email: payload.email,
    role: payload.role,
    gymId: payload.gymId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || typeof payload.role !== "string") {
      return null;
    }
    return {
      sub: payload.sub,
      name: typeof payload.name === "string" ? payload.name : "",
      email: typeof payload.email === "string" ? payload.email : "",
      role: payload.role as Role,
      gymId: typeof payload.gymId === "string" ? payload.gymId : null,
    };
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;
