import type { VisualPlan } from "@/types";
import { askChatPlanner } from "@/lib/chat-api";
import { appLog } from "@/lib/app-log";
import { parsePlannerJson } from "@/lib/parse-planner-json";

export async function askPlannerForJson(input: {
  prompt: string;
  topic: string;
  contextLabel: string;
}): Promise<VisualPlan> {
  const firstReply = await askChatPlanner(input.prompt);
  const firstPlan = tryParsePlan(firstReply);
  if (firstPlan) return firstPlan;

  appLog("warn", "planner.json_repair_started", {
    contextLabel: input.contextLabel
  });

  const repairReply = await askChatPlanner(`
Return only valid JSON for this VisualWiki page plan.
Do not say Certainly. Do not include markdown. Do not explain.

Topic:
"${input.topic}"

Required JSON shape:
{
  "title": "short topic-specific title",
  "subtitle": "short subtitle",
  "mainScene": "clear central image description",
  "sections": [
    {
      "label": "short label",
      "description": "what this section explains visually",
      "nextTopic": "specific deeper topic"
    }
  ],
  "footerCaption": "short caption"
}

Rules:
- exactly 7 sections
- topic-specific labels
- no placeholders
- valid JSON only

Previous invalid response:
${firstReply.slice(0, 2500)}
`.trim());

  const repairedPlan = tryParsePlan(repairReply);
  if (repairedPlan) return repairedPlan;

  appLog("warn", "planner.dynamic_plan_used", {
    contextLabel: input.contextLabel
  });
  return buildDynamicPlan(input.topic);
}

function tryParsePlan(reply: string) {
  try {
    return parsePlannerJson(reply);
  } catch {
    return null;
  }
}

function buildDynamicPlan(topic: string): VisualPlan {
  const cleanTopic = topic.trim().replace(/\s+/g, " ").slice(0, 80) || "Visual Topic";
  const base = [
    ["Core Concept", "The central idea and why it matters"],
    ["Main Parts", "The important components and roles"],
    ["Process", "How the system or idea works over time"],
    ["Relationships", "How the parts influence each other"],
    ["Patterns", "Important signals, structures, or recurring forms"],
    ["Applications", "Where the concept appears or is used"],
    ["Deeper Questions", "Advanced details worth exploring next"]
  ];

  return {
    title: cleanTopic,
    subtitle: `A visual explainer for ${cleanTopic}`,
    mainScene: `A complete visual map of ${cleanTopic} with labeled relationships and meaningful details`,
    sections: base.map(([label, description]) => ({
      label,
      description: `${description} in ${cleanTopic}`,
      nextTopic: `${cleanTopic} ${label.toLowerCase()}`
    })),
    footerCaption: `Click any region to explore ${cleanTopic} more deeply`
  };
}
