"use client";

export function ErrorBubble({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="ui-font rounded-2xl border border-[#b45353]/25 bg-[#fffaf0] px-4 py-3 text-sm font-semibold text-[#7d3131] shadow-lg">
      {message}
    </div>
  );
}
