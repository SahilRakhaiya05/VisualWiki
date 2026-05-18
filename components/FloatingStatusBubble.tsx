"use client";

export function FloatingStatusBubble({
  message,
  x,
  y
}: {
  message?: string;
  x?: number;
  y?: number;
}) {
  if (!message) return null;

  return (
    <div
      className="ui-font pointer-events-none absolute z-10 max-w-xs rounded-2xl border border-[#23352f]/20 bg-[#fffaf0] px-4 py-3 text-sm font-semibold text-[#172b27] shadow-xl"
      style={{
        left: x === undefined ? "50%" : x,
        top: y === undefined ? "50%" : y,
        transform: "translate(-50%, -120%)"
      }}
    >
      {message}
    </div>
  );
}
