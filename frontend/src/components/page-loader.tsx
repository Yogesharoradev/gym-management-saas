import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  label?: string;
  fullScreen?: boolean;
}

export function PageLoader({ label = "Loading your workspace…", fullScreen = true }: PageLoaderProps) {
  return (
    <div
      className={
        fullScreen
          ? "fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 text-white"
          : "flex min-h-[280px] w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-950 px-6 text-white"
      }
      role="status"
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_75%_75%,rgba(6,182,212,0.10),transparent_30%)]" />
      <div className="relative flex flex-col items-center text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 shadow-lg shadow-emerald-500/10">
          <span className="absolute inset-0 animate-ping rounded-2xl border border-emerald-400/20" />
          <Loader2 className="h-7 w-7 animate-spin text-emerald-400" />
        </div>
        <p className="mt-5 font-heading text-lg font-bold tracking-tight">GymOS</p>
        <p className="mt-1 text-sm text-white/45">{label}</p>
        <div className="mt-5 h-1 w-32 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-[loader-progress_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
        </div>
      </div>
    </div>
  );
}
