"use client";

import { ChevronRight } from "lucide-react";

export function BreadcrumbTrail({ items }: { items: string[] }) {
  if (!items.length) {
    return <p className="ui-font text-sm text-[#5a6f68]">No page yet</p>;
  }

  return (
    <nav className="ui-font flex min-w-0 flex-wrap items-center gap-1 text-sm font-semibold text-[#5a6f68]">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="flex min-w-0 items-center gap-1">
          <span className={index === items.length - 1 ? "text-[#172b27]" : ""}>
            {item}
          </span>
          {index < items.length - 1 && <ChevronRight className="h-4 w-4 shrink-0" />}
        </span>
      ))}
    </nav>
  );
}
