"use client";

import { useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ClickMarker } from "@/components/ClickMarker";
import { ClickRipple } from "@/components/ClickRipple";
import { EmptyState } from "@/components/EmptyState";
import { FloatingStatusBubble } from "@/components/FloatingStatusBubble";
import { GenerationLoader } from "@/components/GenerationLoader";
import { normalizeContainedImageClick } from "@/lib/coordinates";
import type { NormalizedClick } from "@/types";

type Props = {
  imageUrl?: string;
  pageId?: string;
  title?: string;
  loading?: boolean;
  onClickPoint: (input: { pageId: string } & NormalizedClick) => void;
};

export function ImageStage({ imageUrl, pageId, title, loading, onClickPoint }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const [marker, setMarker] = useState<{ x: number; y: number } | null>(null);
  const [bubble, setBubble] = useState("");

  function handleClick(event: React.MouseEvent) {
    if (!imgRef.current || !pageId || loading) return;

    const rect = imgRef.current.getBoundingClientRect();
    const normalized = normalizeContainedImageClick({
      clientX: event.clientX,
      clientY: event.clientY,
      container: rect,
      naturalWidth: imgRef.current.naturalWidth || 16,
      naturalHeight: imgRef.current.naturalHeight || 9
    });

    if (!normalized) return;

    const rippleX = normalized.renderedRect.left - rect.left + normalized.rawX;
    const rippleY = normalized.renderedRect.top - rect.top + normalized.rawY;

    setRipple({ x: rippleX, y: rippleY });
    setMarker({ x: rippleX, y: rippleY });
    setBubble("Fetching information about this area...");
    window.setTimeout(() => setBubble("Planning the next visual page..."), 3000);
    window.setTimeout(() => setBubble("Creating the next image..."), 7000);
    window.setTimeout(
      () => setBubble("You can keep this page open while the next visual is created."),
      12000
    );
    window.setTimeout(() => setRipple(null), 700);
    onClickPoint({ pageId, ...normalized });
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#fffaf0]">
      {imageUrl ? (
        <img
          ref={imgRef}
          src={imageUrl}
          alt={title || "Generated visual page"}
          className={`h-full w-full object-contain transition duration-500 ${
            loading ? "scale-[1.01] blur-[2px]" : "cursor-crosshair"
          }`}
          onClick={handleClick}
        />
      ) : (
        <EmptyState />
      )}

      <AnimatePresence>{ripple && <ClickRipple x={ripple.x} y={ripple.y} />}</AnimatePresence>
      {loading && imageUrl && marker && <ClickMarker x={marker.x} y={marker.y} />}
      {loading && imageUrl && marker && (
        <FloatingStatusBubble message={bubble} x={marker.x} y={marker.y} />
      )}
      {loading && (
        <GenerationLoader
          message={imageUrl ? "Creating deeper visual page..." : undefined}
        />
      )}
    </div>
  );
}
