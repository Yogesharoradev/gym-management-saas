import { Megaphone } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function AnnouncementsPage() {
  return (
    <ComingSoon
      icon={Megaphone}
      title="Announcements"
      description="Broadcast updates and send WhatsApp announcements to members, all from one place."
    />
  );
}
