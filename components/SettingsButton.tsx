"use client";

import { Settings } from "lucide-react";

export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Settings"
      className="grid h-10 w-10 place-items-center rounded-xl border border-[#23352f]/20 bg-[#fffaf0] text-[#274f46] transition hover:bg-[#f7f1e4]"
    >
      <Settings className="h-4 w-4" />
    </button>
  );
}
