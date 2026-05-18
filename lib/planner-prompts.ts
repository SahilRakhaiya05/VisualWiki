import type { VisualWikiSettings } from "@/types";

function settingsBlock(settings?: Partial<VisualWikiSettings>) {
  return `
Visual settings:
- style: ${settings?.style || "Soft Technical Infographic"}
- detail level: ${settings?.detailLevel || "Balanced"}
- text density: ${settings?.textDensity || "Low"}
- click behavior: ${settings?.clickBehavior || "Smart interpretation mode"}

Settings rules:
- If detail level is Simple, use beginner-friendly sections.
- If detail level is Expert, use deeper technical sections.
- If text density is Very Low, use very short labels.
- If text density is Medium, allow slightly more explanatory labels.
- Always keep labels readable.
`.trim();
}

export function buildRootPlannerPrompt(
  topic: string,
  knowledgeContext = "",
  memoryContext = "",
  settings?: Partial<VisualWikiSettings>
) {
  return `
You are the visual planner for an infinite AI-generated visual Wikipedia.

Create a visual page plan for this topic:

"${topic}"

HydraDB Knowledge Context:
"${knowledgeContext}"

HydraDB Memory Context:
"${memoryContext}"

${settingsBlock(settings)}

Return JSON only.

JSON shape:
{
  "title": "short topic-specific title",
  "subtitle": "short topic-specific subtitle",
  "mainScene": "clear description of the central image",
  "sections": [
    {
      "label": "short label",
      "description": "what this section explains visually",
      "nextTopic": "specific deeper topic if user clicks this section"
    }
  ],
  "footerCaption": "short footer caption"
}

Rules:
- Create exactly 7 sections.
- Every section must be directly related to the topic.
- Use specific labels, not generic labels.
- Do not use placeholder text.
- Do not use unrelated examples.
- Do not copy reference image content.
- Reference images are style-only.
- Make the plan specific enough for an image model to draw.
- The plan should support click-to-expand exploration.

Visual style to plan for:
soft muted pastel educational infographic, thin dark outlines, cream callout panels, arrows, inset detail boxes, clean 16:9 explainer layout.

Return valid JSON only.
`.trim();
}

export function buildChildPlannerPrompt(input: {
  parentTopic: string;
  clickedLabel: string;
  nextTopic: string;
  breadcrumbPath: string[];
  hydraContext?: string;
  knowledgeContext?: string;
  memoryContext?: string;
  settings?: Partial<VisualWikiSettings>;
}) {
  return `
You are the visual planner for an infinite AI-generated visual Wikipedia.

The user clicked a concept inside a generated visual page.

Parent topic:
"${input.parentTopic}"

Clicked concept:
"${input.clickedLabel}"

Next deeper topic:
"${input.nextTopic}"

Exploration path:
"${input.breadcrumbPath.join(" > ")}"

HydraDB Knowledge Context:
"${input.knowledgeContext || input.hydraContext || ""}"

HydraDB Memory Context:
"${input.memoryContext || ""}"

${settingsBlock(input.settings)}

Return JSON only.

JSON shape:
{
  "title": "short title for the clicked concept",
  "subtitle": "short subtitle",
  "mainScene": "clear description of the central image",
  "sections": [
    {
      "label": "short label",
      "description": "what this section explains visually",
      "nextTopic": "specific deeper topic if user clicks this section"
    }
  ],
  "footerCaption": "short footer caption"
}

Rules:
- Create exactly 7 sections.
- Make this page a deeper zoom into the clicked concept.
- Keep it connected to the parent topic.
- Do not repeat the parent page.
- Do not use generic labels.
- Do not use unrelated examples.
- Do not copy reference image content.
- Reference images are style-only.
- Make the plan specific enough for an image model to draw.
- The next page should feel like the user entered the clicked object/concept.

Visual style to plan for:
soft muted pastel educational infographic, thin dark outlines, cream callout panels, arrows, inset detail boxes, clean 16:9 explainer layout.

Return valid JSON only.
`.trim();
}

export function buildUploadedImagePlannerPrompt(input: {
  mode: "explain" | "style-reference";
  userInstruction?: string;
  imageSummary: string;
  visualElements?: string[];
  hydraContext?: string;
  settings?: Partial<VisualWikiSettings>;
}) {
  return `
You are the visual planner for an infinite AI visual browser.

The user uploaded an image.

Upload mode:
"${input.mode}"

User instruction:
"${input.userInstruction || ""}"

Extracted image summary:
"${input.imageSummary}"

Detected visual elements:
"${(input.visualElements || []).join(", ")}"

HydraDB recalled context:
"${input.hydraContext || ""}"

${settingsBlock(input.settings)}

Create a new explorable visual page plan.

Return JSON only:

{
  "title": "short title",
  "subtitle": "short subtitle",
  "mainScene": "central image description",
  "sections": [
    {
      "label": "short clickable label",
      "description": "what this area explains",
      "nextTopic": "deeper topic"
    }
  ],
  "footerCaption": "short caption"
}

Rules:
- Create exactly 7 sections.
- If mode is "explain", base the content on the uploaded image.
- If mode is "style-reference", do not copy content from the image.
- Make sections useful as click targets.
- Use short labels.
- Return valid JSON only.
`.trim();
}
