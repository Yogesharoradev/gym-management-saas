import { type NextRequest } from "next/server";
import { jsonOk } from "@/lib/api";
import { requireApiGymAdmin } from "@/lib/auth/api-guard";
import { listMembershipExpiry, type ExpiryBucket } from "@/lib/data/membership-expiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const buckets = new Set<ExpiryBucket>(["TODAY", "THREE_DAYS", "SEVEN_DAYS", "THIRTY_DAYS", "EXPIRED"]);

export async function GET(request: NextRequest) {
  const auth = await requireApiGymAdmin();
  if (!auth.ok) return auth.response;
  const rawBucket = request.nextUrl.searchParams.get("bucket") as ExpiryBucket | null;
  const bucket = rawBucket && buckets.has(rawBucket) ? rawBucket : undefined;
  return jsonOk(await listMembershipExpiry(auth.user.gymId as string, bucket, request.nextUrl.searchParams.get("q") ?? undefined));
}
