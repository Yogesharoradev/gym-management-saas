import { requireGymContext } from "@/lib/auth/guards";
import { MembersClient } from "./_components/members-client";
import { ImportMembersButton } from "./_components/import-members-button";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  await requireGymContext();

  return (
    <div className="space-y-3">
      <MembersClient actions={<ImportMembersButton />} />
    </div>
  );
}
