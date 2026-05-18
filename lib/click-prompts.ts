import type { Hotspot, Page } from "@/types";

export function buildClickInterpreterPrompt(input: {
  page: Page;
  hotspots: Hotspot[];
  x: number;
  y: number;
}) {
  const sectionList = input.hotspots
    .map((hotspot) => `${hotspot.label}: ${hotspot.description}`)
    .join("\n");

  return `
You are the click interpreter for an infinite AI visual browser.

The user clicked a generated visual page.

Page title:
"${input.page.title}"

Topic:
"${input.page.topic}"

Breadcrumb path:
"${input.page.breadcrumbPath.join(" > ")}"

Known visual sections:
"${sectionList}"

Click coordinate:
x=${input.x}, y=${input.y}

Task:
Identify the most likely concept or region clicked.
Return JSON only:

{
  "clickedConcept": "short concept label",
  "nextTopic": "specific deeper topic",
  "confidence": 0.0,
  "reason": "short reason",
  "loadingMessage": "Fetching information about ..."
}

Rules:
- Use known sections first.
- If the click is near the central area, choose the central concept.
- If the click is near a callout region, choose that callout.
- Do not invent unrelated concepts.
- Keep the next topic focused and deeper than the current page.
- Return valid JSON only.
`.trim();
}
