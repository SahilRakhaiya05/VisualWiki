"use client";

export function ImageAnalyzeStatus({ status }: { status?: string }) {
  if (!status) return null;
  return (
    <p className="ui-font mt-2 rounded-xl bg-[#edf5f1] px-3 py-2 text-xs font-bold text-[#5a6f68]">
      {status}
    </p>
  );
}
