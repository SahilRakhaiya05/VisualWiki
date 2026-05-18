"use client";

import { ImagePlus } from "lucide-react";
import { validateImageUpload } from "@/lib/upload-validation";

export function UploadImageOnly({
  disabled,
  onInvalid,
  onSelect
}: {
  disabled?: boolean;
  onInvalid: (message: string) => void;
  onSelect: (file: File) => void;
}) {
  return (
    <label className="ui-font grid h-12 w-12 cursor-pointer place-items-center rounded-2xl border border-[#23352f]/20 bg-[#f7f1e4] text-[#274f46] transition hover:bg-[#fffaf0]" title="Upload image">
      <ImagePlus className="h-5 w-5" />
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        disabled={disabled}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.currentTarget.value = "";
          if (!file) return;
          const error = validateImageUpload(file);
          if (error) {
            onInvalid(error);
            return;
          }
          onSelect(file);
        }}
      />
    </label>
  );
}
