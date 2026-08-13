import "server-only";
import { type NextResponse } from "next/server";
import { getAuthState } from "@/lib/auth/session";
import { jsonError } from "@/lib/api";
import { ROLES } from "@/lib/constants";
import type { SessionUser } from "@/types";

type ApiAuthOk = { ok: true; user: SessionUser };
type ApiAuthFail = { ok: false; response: NextResponse };
export type ApiAuthResult = ApiAuthOk | ApiAuthFail;

/**
 * Server-side authorization for API route handlers. The role is derived from
 * the verified session (never from client input) and re-validated against the
 * database inside getAuthState().
 */
export async function requireApiSuperAdmin(): Promise<ApiAuthResult> {
  const state = await getAuthState();
  if (!state) {
    return { ok: false, response: jsonError("Not authenticated", 401) };
  }
  if (state.user.role !== ROLES.SUPER_ADMIN) {
    return { ok: false, response: jsonError("Forbidden", 403) };
  }
  return { ok: true, user: state.user };
}
