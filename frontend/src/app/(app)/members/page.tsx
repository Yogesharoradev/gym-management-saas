import { Users } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function MembersPage() {
  return (
    <ComingSoon
      icon={Users}
      title="Members"
      description="Add, search and manage your gym members with profiles, photos and membership history."
    />
  );
}
