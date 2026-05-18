export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
] as const;

export const MAX_IMAGE_UPLOAD_SIZE = 10 * 1024 * 1024;

export function validateImageUpload(input: {
  type?: string;
  size?: number;
  name?: string;
}) {
  if (!input.type || !ALLOWED_IMAGE_TYPES.includes(input.type as any)) {
    return "Please upload an image file only.";
  }

  if (!input.size || input.size > MAX_IMAGE_UPLOAD_SIZE) {
    return "Image must be 10 MB or smaller.";
  }

  return "";
}
