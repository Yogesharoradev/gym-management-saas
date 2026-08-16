import { requireGymContext } from "@/lib/auth/guards";
import { ExpiryClient } from "./_components/expiry-client";

export const dynamic = "force-dynamic";

export default async function ExpiryPage() {
  await requireGymContext();
  return <ExpiryClient />;
}
