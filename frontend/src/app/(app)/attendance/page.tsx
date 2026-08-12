import { CalendarCheck } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function AttendancePage() {
  return (
    <ComingSoon
      icon={CalendarCheck}
      title="Attendance"
      description="Record daily check-ins manually today, with fingerprint device support planned for the future."
    />
  );
}
