import { NextResponse } from "next/server";
import { askChatPlanner } from "@/lib/chat-api";
import { appLog, nowMs } from "@/lib/app-log";
import { validateImageUpload } from "@/lib/upload-validation";

export async function POST(req: Request) {
  const started = nowMs();
  try {
    const form = await req.formData();
    const file = form.get("file");
    const mode = String(form.get("mode") || "explain") as
      | "explain"
      | "style-reference";
    const instruction = String(form.get("instruction") || "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    const validationError = validateImageUpload(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (!process.env.IMAGE_ANALYZE_API_BASE_URL && !instruction) {
      return NextResponse.json(
        {
          error:
            "Describe what this image shows so VisualWiki can make it explorable.",
          requiresDescription: true
        },
        { status: 400 }
      );
    }

    let summary = instruction;
    let detectedTitle = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
    let visualElements = instruction
      .split(/[,.;\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 7);

    if (process.env.IMAGE_ANALYZE_API_BASE_URL) {
      throw new Error("Configured image analysis endpoint is not implemented yet.");
    }

    const reply = await askChatPlanner(`
Create a concise, honest extraction JSON from the user's image description.
You did not see the pixels; use only this user-provided description and file name.

File name: "${file.name}"
Mode: "${mode}"
User description: "${instruction}"

Return JSON only:
{
  "summary": "source-grounded summary",
  "detectedTitle": "short title",
  "visualElements": ["..."],
  "possibleClickTargets": [
    {"label":"...","description":"...","nextTopic":"..."}
  ]
}
`.trim());

    try {
      const parsed = JSON.parse(
        reply
          .replace(/^```json/i, "")
          .replace(/^```/i, "")
          .replace(/```$/i, "")
          .trim()
      );
      summary = parsed.summary || summary;
      detectedTitle = parsed.detectedTitle || detectedTitle;
      visualElements = Array.isArray(parsed.visualElements)
        ? parsed.visualElements.slice(0, 7)
        : visualElements;
      appLog("info", "image.analyzed", {
        mode,
        durationMs: nowMs() - started,
        hasVisionApi: false
      });
      return NextResponse.json({
        summary,
        detectedTitle,
        visualElements,
        possibleClickTargets: Array.isArray(parsed.possibleClickTargets)
          ? parsed.possibleClickTargets.slice(0, 7)
          : [],
        mode
      });
    } catch {
      return NextResponse.json({
        summary,
        detectedTitle,
        visualElements,
        possibleClickTargets: [],
        mode
      });
    }
  } catch (error: any) {
    appLog("error", "image.analyze_failed", {
      durationMs: nowMs() - started,
      message: error.message
    });
    return NextResponse.json(
      { error: error.message || "Failed to analyze image" },
      { status: 500 }
    );
  }
}
