import { IndianRupee } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function PaymentsPage() {
  return (
    <ComingSoon
      icon={IndianRupee}
      title="Payments"
      description="Record payments, track collections and manage pending dues across all your members."
    />
  );
}
