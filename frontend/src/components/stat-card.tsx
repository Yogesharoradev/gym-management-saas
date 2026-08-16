import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  accent?: boolean;
  testId?: string;
}

export function StatCard({ label, value, helper, icon: Icon, accent = false, testId }: StatCardProps) {
  return (
    <Card
      className="group relative h-full overflow-hidden rounded-2xl border-border/70 bg-card/90 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md sm:p-5"
      data-testid={testId}
    >
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary/[0.04] blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-3">
        <span className="overline text-muted-foreground">{label}</span>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground transition-colors",
            accent && "border-primary/20 bg-primary/10 text-primary",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="relative mt-5 truncate font-heading text-2xl font-black leading-none tracking-tight sm:text-3xl">
        {value}
      </p>
      {helper ? <p className="relative mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{helper}</p> : null}
    </Card>
  );
}
