"use client";

export function UploadedImagePreview({
  src,
  name
}: {
  src?: string;
  name?: string;
}) {
  if (!src) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-[#23352f]/18 bg-[#edf5f1]">
      <img src={src} alt={name || "Uploaded image"} className="aspect-video max-h-28 w-full object-contain" />
      {name && <p className="ui-font truncate px-3 py-1.5 text-xs font-semibold text-[#5a6f68]">{name}</p>}
    </div>
  );
}
