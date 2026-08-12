import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";

export function ComingSoon({
  icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6" data-testid="coming-soon">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="overline">Module</p>
          <h2 className="mt-1 font-heading text-2xl font-black tracking-tighter">
            {title}
          </h2>
        </div>
        <Badge variant="muted">Coming soon</Badge>
      </div>
      <EmptyState
        icon={icon}
        title={`${title} is on the way`}
        description={description}
      />
    </div>
  );
}
