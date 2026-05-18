export async function generateImageFromPrompt(prompt: string): Promise<string> {
  const endpoint =
    process.env.IMAGE_API_BASE_URL ||
    "http://de3.bot-hosting.net:21007/kilwa-gpt-img";

  const timeoutMs = Number(process.env.IMAGE_API_TIMEOUT_MS || 240000);
  const url = `${endpoint}?text=${encodeURIComponent(prompt)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Image generation failed with status ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await response.json();

      if (data.status && data.status !== "success") {
        throw new Error("Image API returned non-success status");
      }

      const imageUrl =
        data.image_url ||
        data.imageUrl ||
        data.url ||
        data.image ||
        data.data?.image_url ||
        data.data?.imageUrl ||
        data.data?.url;

      if (!imageUrl || typeof imageUrl !== "string") {
        throw new Error("Image API response did not include image_url");
      }

      return imageUrl.trim();
    }

    const text = await response.text();

    if (text.trim().startsWith("http")) {
      return text.trim();
    }

    throw new Error("Image API returned unknown response format");
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Image generation timed out. Please try again.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
