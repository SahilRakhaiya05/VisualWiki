"use client";

export function BreadcrumbPill({ items }: { items: string[] }) {
  return (
    <div className="ui-font min-w-0 flex-1 truncate rounded-full border border-[#23352f]/15 bg-[#edf5f1] px-4 py-2 text-sm font-semibold text-[#5a6f68]">
      {items.length ? items.join(" / ") : "VisualWiki / Start a session"}
    </div>
  );
}
