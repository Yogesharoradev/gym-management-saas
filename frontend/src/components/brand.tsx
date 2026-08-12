import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({
  className,
  subtitle,
}: {
  className?: string;
  subtitle?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)} data-testid="brand-logo">
      <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary text-primary-foreground">
        <Dumbbell className="h-5 w-5" />
      </div>
      <div className="leading-none">
        <span className="font-heading text-lg font-black tracking-tighter">GymOS</span>
        {subtitle ? (
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
