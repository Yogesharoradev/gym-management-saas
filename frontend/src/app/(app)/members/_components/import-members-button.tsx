"use client";

import * as React from "react";
import {
  Download,
  FileSpreadsheet,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImportIssue {
  rowNumber: number;
  field: string;
  message: string;
}

interface ImportResponse {
  importedCount: number;
  skippedCount: number;
  invalidCount: number;
  issues: ImportIssue[];
  error?: string;
}

export function ImportMembersButton() {
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<ImportResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Body scroll lock when dialog is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  function chooseFile(selected: File | null) {
    setError(null);
    setResult(null);
    if (!selected) return;
    const isExcel =
      selected.name.toLowerCase().endsWith(".xlsx") ||
      selected.name.toLowerCase().endsWith(".xls");
    if (!isExcel) {
      setFile(null);
      setError("Please choose an .xlsx or .xls file.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setFile(null);
      setError("The file must be smaller than 5 MB.");
      return;
    }
    setFile(selected);
  }

  async function importFile() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/members/import", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as ImportResponse;
      if (!response.ok)
        throw new Error(data.error ?? "Unable to import members");
      setResult(data);
      setFile(null);
      if (data.importedCount > 0)
        window.setTimeout(() => window.location.reload(), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to import members");
    } finally {
      setLoading(false);
    }
  }

  function close() {
    if (loading) return;
    setOpen(false);
    setFile(null);
    setResult(null);
    setError(null);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 shrink-0 flex-row items-center justify-center gap-2 whitespace-nowrap rounded-xl border-emerald-200 bg-white px-4 font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50"
      >
        <Upload className="h-4 w-4 shrink-0" />
        Import members
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Import members"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="w-full max-w-2xl my-auto sm:my-0 overflow-hidden rounded-[1.5rem] border border-white/70 bg-white shadow-2xl shadow-slate-900/20 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            {/* Header - Fixed/Sticky */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <FileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span className="font-heading text-base sm:text-lg font-bold text-slate-900 truncate">
                      Import members
                    </span>
                  </div>
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500 truncate">
                    Add hundreds of members at once using the Fitaah Excel
                    template.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  disabled={loading}
                  className="shrink-0 rounded-lg p-1.5 sm:p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Steps - Responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-700">
                    1. Download
                  </p>
                  <p className="mt-0.5 sm:mt-1 text-xs leading-5 text-slate-500">
                    Use our ready-made Excel template.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = "/api/members/import";
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download template
                  </button>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-700">2. Fill</p>
                  <p className="mt-0.5 sm:mt-1 text-xs leading-5 text-slate-500">
                    One member per row. Phone and name are required.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-700">3. Import</p>
                  <p className="mt-0.5 sm:mt-1 text-xs leading-5 text-slate-500">
                    We validate rows and skip duplicates safely.
                  </p>
                </div>
              </div>

              {/* Drop Zone */}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  chooseFile(event.dataTransfer.files[0] ?? null);
                }}
                className={`flex min-h-[140px] sm:min-h-44 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 sm:px-5 py-6 sm:py-8 text-center transition-colors ${
                  dragging
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-slate-200 bg-slate-50/70 hover:border-emerald-300 hover:bg-emerald-50/40"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(event) =>
                    chooseFile(event.target.files?.[0] ?? null)
                  }
                />
                <FileSpreadsheet className="h-7 w-7 sm:h-9 sm:w-9 text-emerald-600" />
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-semibold text-slate-800 break-all max-w-full px-2">
                  {file ? file.name : "Drop your Excel file here"}
                </p>
                <p className="mt-1 text-[10px] sm:text-xs text-slate-500 px-2">
                  {file
                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected`
                    : "or click to browse · .xlsx / .xls · max 5 MB · up to 1,000 rows"}
                </p>
                {file && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setError(null);
                    }}
                    className="mt-2 text-xs font-medium text-rose-600 hover:text-rose-700"
                  >
                    Remove file
                  </button>
                )}
              </button>

              {/* Error */}
              {error ? (
                <div className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-rose-700">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="break-words">{error}</span>
                </div>
              ) : null}

              {/* Result */}
              {result ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    Import completed
                  </div>
                  <div className="mt-2 sm:mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">
                    <div className="rounded-xl bg-white/80 p-2 sm:p-3">
                      <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Imported
                      </p>
                      <p className="mt-0.5 sm:mt-1 text-lg sm:text-xl font-black text-emerald-700">
                        {result.importedCount}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/80 p-2 sm:p-3">
                      <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Skipped
                      </p>
                      <p className="mt-0.5 sm:mt-1 text-lg sm:text-xl font-black text-amber-600">
                        {result.skippedCount}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/80 p-2 sm:p-3">
                      <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Invalid
                      </p>
                      <p className="mt-0.5 sm:mt-1 text-lg sm:text-xl font-black text-rose-600">
                        {result.invalidCount}
                      </p>
                    </div>
                  </div>
                  {result.issues.length > 0 ? (
                    <div className="mt-2 sm:mt-3 max-h-24 sm:max-h-32 overflow-y-auto rounded-xl bg-white/70 p-2 sm:p-3 text-[10px] sm:text-xs text-slate-600">
                      {result.issues.slice(0, 8).map((issue) => (
                        <p
                          key={`${issue.rowNumber}-${issue.field}`}
                          className="py-0.5 sm:py-1"
                        >
                          <span className="font-bold">
                            Row {issue.rowNumber}
                          </span>{" "}
                          · {issue.field}: {issue.message}
                        </p>
                      ))}
                    </div>
                  ) : null}
                  {result.importedCount > 0 ? (
                    <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs font-medium text-emerald-700">
                      Refreshing your member list…
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Footer - Fixed/Sticky at bottom */}
            <div className="sticky bottom-0 z-10 bg-white border-t border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={close}
                  disabled={loading}
                  className="w-full sm:w-auto h-9 sm:h-10 rounded-xl text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => void importFile()}
                  disabled={!file || loading}
                  className="w-full sm:w-auto h-9 sm:h-10 rounded-xl bg-emerald-600 px-4 sm:px-5 font-semibold hover:bg-emerald-700 text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      Importing…
                    </>
                  ) : (
                    <>
                      <Upload className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Import members
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
