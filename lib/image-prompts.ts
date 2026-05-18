import type { VisualPlan, VisualWikiSettings } from "@/types";

function compact(value = "", limit = 1600) {
  return value.trim().replace(/\s+/g, " ").slice(0, limit);
}

export function buildImagePromptFromPlan(input: {
  topic: string;
  plan: VisualPlan;
  hydraContext?: string;
  mode: "root" | "child";
  settings?: Partial<VisualWikiSettings>;
}) {
  const sectionList = input.plan.sections
    .map(
      (section, index) =>
        `${index + 1}. ${section.label} - ${section.description}`
    )
    .join("\n");

  return `
Create a new original 16:9 educational infographic image about:

"${input.topic}"

Image title:
"${input.plan.title}"

Subtitle:
"${input.plan.subtitle}"

Central scene:
"${compact(input.plan.mainScene, 400)}"

Use these visible sections as labels and visual areas:
${sectionList}

Footer caption:
"${compact(input.plan.footerCaption, 180)}"

Retrieved context to respect:
"${compact(input.hydraContext || "", 1800)}"

Style selected:
"${input.settings?.style || "Soft Technical Infographic"}"

Detail level:
"${input.settings?.detailLevel || "Balanced"}"

Text density:
"${input.settings?.textDensity || "Low"}"

Use these settings while generating the visual page.

Reference style rule:
Any reference images are style references only.
Do not copy their content, objects, exact layout, exact text, brand, exact composition, or domain-specific elements.
Only use the broad visual style: soft muted colors, clean educational infographic layout, thin dark outlines, cream information panels, labeled callout boxes, arrows, inset detail panels, and polished 16:9 explainer composition.

Visual style:
Soft Technical Infographic.
Soft muted pastel background.
Cream/off-white callout panels.
Thin dark charcoal outlines.
Clean hand-drawn technical illustration.
Subtle isometric details where useful.
Soft shadows.
Elegant spacing.
Premium educational visual browser page.

Composition requirements:
- Large readable title at top.
- Short subtitle under title.
- Strong central illustration based on the central scene.
- Two large callout panels.
- Four smaller lower detail/process panels.
- Arrows or connectors showing relationships.
- Optional inset zoom detail.
- Footer caption at bottom.
- Balanced layout.
- No empty boxes.
- No blank panels.
- Every panel should contain useful topic-specific visual content.
- Every section must contain useful topic-specific visual details.
- Do not create a wireframe.
- Do not create a UI mockup.
- Create a finished infographic illustration.

Text rules:
Use short readable labels only.
Avoid long paragraphs.
All text must be rendered inside the image.

Important:
Make the image specific to the topic.
Do not generate a generic blank template.
Do not leave panels empty.
Create a complete polished image.
`.trim();
}
