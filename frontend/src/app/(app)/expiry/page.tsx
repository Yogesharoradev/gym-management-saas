import { Clock } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function ExpiryPage() {
  return (
    <ComingSoon
      icon={Clock}
      title="Expiry &amp; Renewals"
      description="Stay ahead of expiring memberships and send timely renewal reminders to members."
    />
  );
}
