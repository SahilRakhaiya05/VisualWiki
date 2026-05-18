"use client";

import type { ReactNode } from "react";
import { BreadcrumbPill } from "@/components/BreadcrumbPill";
import { ExportMenu } from "@/components/ExportMenu";
import { HydraStatusDot } from "@/components/HydraStatusDot";

export function VisualBrowserFrame({
  breadcrumbs,
  disabled,
  hydraStatus,
  depth,
  generatedAt,
  children,
  onExportPdf,
  onCopyJson
}: {
  breadcrumbs: string[];
  disabled?: boolean;
  hydraStatus?: "connected" | "local";
  depth?: number;
  generatedAt?: string;
  children: ReactNode;
  onExportPdf: () => void;
  onCopyJson: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.5rem] border-2 border-[#23352f]/25 bg-[#fffaf0] shadow-2xl">
      <div className="flex shrink-0 items-center gap-3 border-b border-[#23352f]/15 bg-[#f7f1e4] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#b45353]" />
          <span className="h-3 w-3 rounded-full bg-[#b89a68]" />
          <span className="h-3 w-3 rounded-full bg-[#274f46]" />
        </div>
        <BreadcrumbPill items={breadcrumbs} />
        <ExportMenu
          disabled={disabled}
          onExportPdf={onExportPdf}
          onCopyJson={onCopyJson}
        />
      </div>
      <div className="min-h-0 flex-1">{children}</div>
      <div className="ui-font flex shrink-0 flex-col items-center justify-between gap-2 border-t border-[#23352f]/12 bg-[#fffaf0] px-4 py-2 text-center text-xs font-semibold text-[#5a6f68] md:flex-row">
        <span>Tap anywhere on the page to expand</span>
        <span>Depth {depth ?? 0}</span>
        <span>{generatedAt ? new Date(generatedAt).toLocaleString() : "Not generated yet"}</span>
        <HydraStatusDot status={hydraStatus || "local"} />
      </div>
    </div>
  );
}
