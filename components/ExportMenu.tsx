"use client";

import { Download, Share2 } from "lucide-react";

export function ExportMenu({
  disabled,
  onExportPdf,
  onCopyJson
}: {
  disabled?: boolean;
  onExportPdf: () => void;
  onCopyJson: () => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={onExportPdf}
        className="grid h-10 w-10 place-items-center rounded-xl border border-[#23352f]/20 bg-[#fffaf0] text-[#274f46] disabled:opacity-45"
        title="Export PDF"
      >
        <Download className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onCopyJson}
        className="grid h-10 w-10 place-items-center rounded-xl border border-[#23352f]/20 bg-[#fffaf0] text-[#274f46] disabled:opacity-45"
        title="Copy share JSON"
      >
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );
}
