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

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  accent = false,
  testId,
}: StatCardProps) {
  return (
    <Card
      className="group h-full p-5 transition-transform duration-150 hover:-translate-y-0.5 hover:border-foreground/30"
      data-testid={testId}
    >
      <div className="flex items-start justify-between">
        <span className="overline">{label}</span>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground",
            accent && "border-primary/30 bg-primary/10 text-primary",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 font-heading text-3xl font-black leading-none tracking-tighter">
        {value}
      </p>
      {helper ? (
        <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </Card>
  );
}
