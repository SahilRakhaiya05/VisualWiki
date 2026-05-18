import type { VisualPlan } from "@/types";

export function parsePlannerJson(reply: string): VisualPlan {
  let text = reply.trim();

  text = text
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  if (!text.startsWith("{") && /^"title"\s*:/.test(text)) {
    text = `{${text}`;
  }

  text = extractFirstJsonObject(text);

  const parsed = JSON.parse(text);

  if (!parsed.title || !parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error("Planner JSON missing required fields");
  }

  parsed.subtitle = parsed.subtitle || "Visual explainer";
  parsed.mainScene = parsed.mainScene || `A central illustration about ${parsed.title}`;
  parsed.footerCaption = parsed.footerCaption || `Explore ${parsed.title} visually`;
  parsed.sections = parsed.sections.slice(0, 7).map((section: any, index: number) => ({
    label: String(section.label || `Detail ${index + 1}`).trim(),
    description: String(
      section.description || `Explore more about ${parsed.title}`
    ).trim(),
    nextTopic: String(
      section.nextTopic || `${parsed.title} detail ${index + 1}`
    ).trim()
  }));

  while (parsed.sections.length < 7) {
    parsed.sections.push({
      label: `Detail ${parsed.sections.length + 1}`,
      description: `Explore more about ${parsed.title}`,
      nextTopic: `${parsed.title} detail ${parsed.sections.length + 1}`
    });
  }

  return parsed as VisualPlan;
}

function extractFirstJsonObject(text: string) {
  const start = text.indexOf("{");
  if (start === -1) return text;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      return text.slice(start, index + 1);
    }
  }

  return text.slice(start);
}
