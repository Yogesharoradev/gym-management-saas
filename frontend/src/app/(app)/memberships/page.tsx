import { CreditCard } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function MembershipsPage() {
  return (
    <ComingSoon
      icon={CreditCard}
      title="Memberships"
      description="Create membership plans, assign them to members and track active and expired subscriptions."
    />
  );
}
