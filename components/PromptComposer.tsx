"use client";

import { useState } from "react";
import { WandSparkles } from "lucide-react";
import { ImageAnalyzeStatus } from "@/components/ImageAnalyzeStatus";
import { UploadImageOnly } from "@/components/UploadImageOnly";
import { UploadedImagePreview } from "@/components/UploadedImagePreview";

export function PromptComposer({
  inputRef,
  topic,
  loading,
  onTopicChange,
  onGenerate,
  onInvalidUpload,
  onImageGenerate
}: {
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  topic: string;
  loading?: boolean;
  onTopicChange: (value: string) => void;
  onGenerate: () => void;
  onInvalidUpload: (message: string) => void;
  onImageGenerate: (file: File, instruction: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  return (
    <section className="rounded-[1.2rem] border border-[#23352f]/18 bg-[#fffaf0]/88 p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-[#274f46]">
        <WandSparkles className="h-4 w-4" />
        <p className="ui-font text-sm font-bold">Start</p>
      </div>
      <textarea
        ref={inputRef}
        value={topic}
        onChange={(event) => onTopicChange(event.target.value)}
        placeholder={file ? "Describe what VisualWiki should explore from this image..." : "Ask VisualWiki to turn any idea into a clickable visual page..."}
        className="ui-font h-24 w-full resize-none rounded-2xl border border-[#23352f]/18 bg-[#edf5f1] p-3 text-sm font-medium text-[#172b27] outline-none focus:border-[#274f46] focus:bg-white"
      />
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          disabled={loading || !topic.trim()}
          onClick={() => {
            if (file) onImageGenerate(file, topic);
            else onGenerate();
          }}
          className="ui-font rounded-2xl bg-[#274f46] px-4 py-3 text-sm font-bold text-[#fffaf0] transition hover:bg-[#1f4038] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {file ? "Create from image" : "Generate page"}
        </button>
        <UploadImageOnly
          disabled={loading}
          onInvalid={onInvalidUpload}
          onSelect={(nextFile) => {
            if (preview) URL.revokeObjectURL(preview);
            setFile(nextFile);
            setPreview(URL.createObjectURL(nextFile));
          }}
        />
      </div>
      <UploadedImagePreview src={preview} name={file?.name} />
      {file && (
        <ImageAnalyzeStatus status="Using your prompt as the image description for this demo." />
      )}
      {!file && (
        <p className="ui-font mt-2 text-xs font-semibold text-[#5a6f68]">
          Upload accepts PNG, JPEG, WebP, or GIF up to 10 MB.
        </p>
      )}
    </section>
  );
}
