import { Dumbbell } from "lucide-react";
import { APP_NAME } from "@/lib/brand";
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
    <div className={cn("flex items-center gap-3", className)} data-testid="brand-logo">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 ring-1 ring-white/10">
        <Dumbbell className="h-5 w-5" strokeWidth={2.5} />
      </div>
      <div className="min-w-0 leading-none">
        <span className="font-heading text-[19px] font-black tracking-[-0.04em] text-white">{APP_NAME}</span>
        {subtitle ? (
          <p className={cn("mt-1.5 truncate text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400", subtitleClassName)}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
