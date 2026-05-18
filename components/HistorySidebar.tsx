"use client";

import type { Page } from "@/types";
import { Layers3 } from "lucide-react";

export function HistorySidebar({
  pages,
  currentPageId,
  onSelect
}: {
  pages: Page[];
  currentPageId?: string;
  onSelect: (page: Page) => void;
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col rounded-[1.2rem] border border-[#23352f]/18 bg-[#fffaf0]/78 p-3 shadow-sm">
      <div className="mb-3 flex shrink-0 items-center gap-2">
        <Layers3 className="h-4 w-4 text-[#274f46]" />
        <h2 className="ui-font text-sm font-bold text-[#172b27]">History</h2>
      </div>
      <div className="min-h-0 space-y-2 overflow-hidden">
        {pages.length === 0 && (
          <p className="ui-font text-sm text-[#5a6f68]">Generated pages will collect here.</p>
        )}
        {pages.map((page) => (
          <button
            key={page.id}
            type="button"
            onClick={() => onSelect(page)}
            className={`w-full rounded-2xl border p-2 text-left transition ${
              page.id === currentPageId
                ? "border-[#274f46]/45 bg-[#edf5f1]"
                : "border-[#23352f]/12 bg-[#fffaf0] hover:bg-[#f7f1e4]"
            }`}
          >
            <div className="aspect-video overflow-hidden rounded-xl border border-[#23352f]/12 bg-[#edf5f1]">
              <img src={page.imageUrl} alt="" className="h-full w-full object-cover" />
            </div>
            <p className="mt-2 line-clamp-1 font-semibold text-[#172b27]">{page.title}</p>
            <p className="ui-font mt-1 text-xs font-semibold text-[#5a6f68]">
              Depth {page.depth}
            </p>
          </button>
        ))}
      </div>
    </aside>
  );
}
