"use client";

export function BookExportModal({ open }: { open: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#172b27]/25">
      <div className="rounded-3xl border border-[#23352f]/20 bg-[#fffaf0] p-6 shadow-2xl">
        <p className="ui-font font-bold text-[#172b27]">Preparing export...</p>
      </div>
    </div>
  );
}
