"use client";

export function HydraStatusDot({
  status = "local"
}: {
  status?: "connected" | "saved" | "saving" | "local";
}) {
  const color =
    status === "connected" || status === "saved"
      ? "bg-[#2f7d55]"
      : status === "saving"
        ? "bg-[#b89a68]"
        : "bg-[#7c8b86]";
  const label =
    status === "connected" || status === "saved"
      ? "HydraDB connected"
      : status === "saving"
        ? "HydraDB saving"
        : "Local memory";

  return (
    <span className="ui-font inline-flex items-center gap-2 text-xs font-bold text-[#5a6f68]">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
