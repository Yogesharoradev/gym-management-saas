import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({
  className,
  subtitle,
  subtitleClassName,
}: {
  className?: string;
  subtitle?: string;
  subtitleClassName?: string;
}) {
  return (
    <div
      className={cn("flex items-center gap-2.5", className)}
      data-testid="brand-logo"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
        <Dumbbell className="h-5 w-5" />
      </div>
      <div className="leading-none">
        <span className="font-heading text-lg font-black tracking-tighter">
          GymOS
        </span>
        {subtitle ? (
          <p
            className={cn(
              "mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground",
              subtitleClassName,
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
