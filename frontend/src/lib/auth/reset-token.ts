import "server-only";
import { randomBytes, createHash } from "node:crypto";

/** Reset token time-to-live: 30 minutes. */
export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

/** Deterministic SHA-256 hash used to store/look up reset tokens. */
export function hashResetToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Generate a cryptographically secure token and its storage hash. */
export function generateResetToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  return { raw, hash: hashResetToken(raw) };
}
