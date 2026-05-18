"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";

export function PageActions({
  canGoBack,
  loading,
  depth,
  onBack,
  onRegenerate
}: {
  canGoBack?: boolean;
  loading?: boolean;
  depth?: number;
  onBack: () => void;
  onRegenerate: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        title="Back"
        disabled={!canGoBack || loading}
        onClick={onBack}
        className="grid h-10 w-10 place-items-center rounded-xl border border-[#23352f]/20 bg-[#fffaf0] text-[#274f46] transition hover:bg-[#f7f1e4] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={onRegenerate}
        className="ui-font inline-flex h-10 items-center gap-2 rounded-xl border border-[#23352f]/20 bg-[#fffaf0] px-3 text-sm font-bold text-[#274f46] transition hover:bg-[#f7f1e4] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <RefreshCw className="h-4 w-4" />
        Regenerate
      </button>
      <span className="ui-font rounded-xl border border-[#23352f]/14 bg-[#edf5f1] px-3 py-2 text-sm font-bold text-[#5a6f68]">
        Depth {depth ?? 0}
      </span>
    </div>
  );
}
