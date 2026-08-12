import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:
    "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30",
  PAST_DUE:
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30",
  SUSPENDED: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",
  CANCELLED:
    "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/30",
  INACTIVE:
    "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/30",
  FROZEN: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
  EXPIRED: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",
  EXPIRING:
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.CANCELLED;
  return (
    <Badge
      variant="outline"
      className={cn(style, className)}
      data-testid={`status-badge-${status.toLowerCase()}`}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
