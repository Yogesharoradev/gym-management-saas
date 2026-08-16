import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  accent?: boolean;
  tone?: "emerald" | "amber" | "rose" | "blue" | "violet" | "orange";
  testId?: string;
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  rose: "bg-rose-50 text-rose-600 ring-rose-100",
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
  orange: "bg-orange-50 text-orange-600 ring-orange-100",
};

export function StatCard({ label, value, helper, icon: Icon, accent = false, tone = "emerald", testId }: StatCardProps) {
  return (
    <Card className="group relative h-full min-w-0 overflow-hidden rounded-[18px] border-slate-200/80 bg-white p-4 shadow-[0_6px_24px_rgba(15,23,42,0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-5" data-testid={testId}>
      <div className="relative flex items-start justify-between gap-2">
        <span className="min-w-0 text-[10px] font-bold uppercase tracking-[0.14em] leading-4 text-slate-400">{label}</span>
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1", toneClasses[tone], accent && "bg-emerald-50 text-emerald-600 ring-emerald-100")}>
          <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
        </span>
      </div>
      <p className="relative mt-5 truncate font-heading text-2xl font-black leading-none tracking-[-0.04em] text-slate-900 sm:text-[27px]">{value}</p>
      {helper ? <p className="relative mt-2 line-clamp-2 text-[11px] leading-5 text-slate-400">{helper}</p> : null}
    </Card>
  );
}
