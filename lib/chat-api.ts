export async function askChatPlanner(text: string): Promise<string> {
  const endpoint =
    process.env.CHAT_API_BASE_URL ||
    "http://de3.bot-hosting.net:21007/kilwa-chatgpt";

  const url = `${endpoint}?text=${encodeURIComponent(text)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Chat API failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "success") {
      throw new Error("Chat API returned non-success status");
    }

    if (!data.reply || typeof data.reply !== "string") {
      throw new Error("Chat API response missing reply");
    }

    return data.reply.trim();
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Planner timed out. Please try again.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
