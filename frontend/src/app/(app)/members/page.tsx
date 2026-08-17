import { MembersClient } from "./_components/members-client";
import { ImportMembersButton } from "./_components/import-members-button";

export const dynamic = "force-dynamic";

export default function MembersPage() {
  return (
    <div className="space-y-3">
      <MembersClient actions={<ImportMembersButton />} />
    </div>
  );
}
