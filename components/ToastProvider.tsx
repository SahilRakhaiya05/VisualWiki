"use client";

export function ToastProvider({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-[#23352f]/20 bg-[#fffaf0] px-4 py-3 text-sm font-bold text-[#172b27] shadow-xl">
      {message}
    </div>
  );
}
