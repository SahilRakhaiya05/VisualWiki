import type { NormalizedClick } from "@/types";

type RectLike = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export function getContainedImageRect(input: {
  container: RectLike;
  naturalWidth: number;
  naturalHeight: number;
}) {
  const imageRatio = input.naturalWidth / input.naturalHeight;
  const containerRatio = input.container.width / input.container.height;

  const width =
    imageRatio > containerRatio
      ? input.container.width
      : input.container.height * imageRatio;
  const height =
    imageRatio > containerRatio
      ? input.container.width / imageRatio
      : input.container.height;

  return {
    left: input.container.left + (input.container.width - width) / 2,
    top: input.container.top + (input.container.height - height) / 2,
    width,
    height
  };
}

export function normalizeContainedImageClick(input: {
  clientX: number;
  clientY: number;
  container: RectLike;
  naturalWidth: number;
  naturalHeight: number;
}): NormalizedClick | null {
  const renderedRect = getContainedImageRect(input);
  const rawX = input.clientX - renderedRect.left;
  const rawY = input.clientY - renderedRect.top;

  if (
    rawX < 0 ||
    rawY < 0 ||
    rawX > renderedRect.width ||
    rawY > renderedRect.height
  ) {
    return null;
  }

  return {
    x: rawX / renderedRect.width,
    y: rawY / renderedRect.height,
    rawX,
    rawY,
    naturalWidth: input.naturalWidth,
    naturalHeight: input.naturalHeight,
    renderedRect
  };
}
