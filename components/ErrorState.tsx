"use client";

export function ErrorState({
  message,
  onRetry
}: {
  message?: string | null;
  onRetry: () => void;
}) {
  if (!message) return null;

  return (
    <div className="rounded-3xl border border-[#23352f]/20 bg-[#fffaf0] p-8 text-center shadow-xl">
      <h2 className="text-2xl font-bold text-[#172b27]">Image generation failed</h2>
      <p className="mt-2 text-[#5a6f68]">
        The image provider did not return a valid image. Please try again.
      </p>
      {message && <p className="mt-2 text-sm text-[#5a6f68]">{message}</p>}
      <button
        onClick={onRetry}
        className="mt-5 rounded-xl bg-[#274f46] px-5 py-3 font-semibold text-white hover:bg-[#1f4038]"
      >
        Retry generation
      </button>
    </div>
  );
}
