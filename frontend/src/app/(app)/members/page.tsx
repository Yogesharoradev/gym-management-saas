import { requireGymContext } from "@/lib/auth/guards";
import { MembersClient } from "./_components/members-client";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  await requireGymContext();
  return <MembersClient />;
}
