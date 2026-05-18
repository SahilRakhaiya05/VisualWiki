"use client";

export function ClickMarker({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="pointer-events-none absolute h-5 w-5 rounded-full border-2 border-[#274f46] bg-[#fffaf0]/50 shadow-lg"
      style={{ left: x - 10, top: y - 10 }}
    />
  );
}
