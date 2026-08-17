import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  label?: string;
  fullScreen?: boolean;
}

export function PageLoader({ label = "Loading your workspace…", fullScreen = false }: PageLoaderProps) {
  return (
    <div
      className={
        fullScreen
          ? "fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-6 text-slate-900"
          : "flex min-h-[calc(100vh-68px)] w-full items-center justify-center overflow-hidden px-6 py-10 text-slate-700"
      }
      role="status"
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(16,185,129,0.07),transparent_30%),radial-gradient(circle_at_75%_75%,rgba(6,182,212,0.06),transparent_30%)]" />
      <div className="relative flex flex-col items-center text-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
          <span className="absolute inset-0 animate-ping rounded-2xl border border-emerald-200" />
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
        <p className="mt-4 font-heading text-base font-bold tracking-tight text-slate-800">Fitaah</p>
        <p className="mt-1 text-sm text-slate-400">{label}</p>
        <div className="mt-4 h-1 w-32 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/2 animate-[loader-progress_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
        </div>
      </div>
    </div>
  );
}
