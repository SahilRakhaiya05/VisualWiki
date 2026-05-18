"use client";

import { Compass, PanelRightOpen, RotateCcw } from "lucide-react";
import { HydraStatusDot } from "@/components/HydraStatusDot";

type Props = {
  hydraStatus: "connected" | "local";
  onSettings: () => void;
  onClear: () => void;
};

export function TopBar({ hydraStatus, onSettings, onClear }: Props) {
  return (
    <header className="z-30 h-[68px] shrink-0 border-b border-[#23352f]/15 bg-[#fffaf0]/90 px-4 py-3 backdrop-blur-xl md:px-6">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-[1.1rem] border border-[#23352f]/25 bg-[#edf5f1] shadow-sm">
            <Compass className="h-6 w-6 text-[#274f46]" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border border-[#fffaf0] bg-[#b89a68]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h1 className="truncate text-2xl font-bold leading-none text-[#172b27]">
                VisualWiki
              </h1>
              <span className="ui-font hidden rounded-full border border-[#23352f]/15 bg-[#edf5f1] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#5a6f68] sm:inline">
                Visual Browser
              </span>
            </div>
            <p className="ui-font mt-1 truncate text-xs font-semibold text-[#5a6f68]">
              Your Wikipedia is an image.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden sm:block">
            <HydraStatusDot status={hydraStatus} />
          </div>
          <button
            type="button"
            onClick={onSettings}
            className="grid h-10 w-10 place-items-center rounded-xl border border-[#23352f]/20 bg-[#fffaf0] text-[#274f46] transition hover:bg-[#f7f1e4]"
            title="Settings"
          >
            <PanelRightOpen className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClear}
            className="grid h-10 w-10 place-items-center rounded-xl border border-[#23352f]/20 bg-[#fffaf0] text-[#274f46] transition hover:bg-[#f7f1e4]"
            title="New session"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
