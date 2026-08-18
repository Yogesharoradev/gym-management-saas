import { BarChart3 } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function ReportsPage() {
  return (
    <ComingSoon
      icon={BarChart3}
      title="Reports"
      description="Analyse revenue, attendance trends and member growth with visual, exportable reports."
    />
  );
}
