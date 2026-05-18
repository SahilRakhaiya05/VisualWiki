import { NextResponse } from "next/server";
import { appLog, nowMs } from "@/lib/app-log";
import { generateImageFromPrompt } from "@/lib/image-api";
import { buildImagePromptFromPlan } from "@/lib/image-prompts";
import { askPlannerForJson } from "@/lib/planner-service";
import { buildRootPlannerPrompt } from "@/lib/planner-prompts";
import { createHotspots } from "@/lib/hotspots";
import { store } from "@/lib/store";
import {
  hydraAddMemory,
  hydraRecallKnowledge,
  hydraRecallMemories,
  hydraWritePage
} from "@/lib/hydradb";

export const maxDuration = 300;

export async function POST(req: Request) {
  const started = nowMs();
  try {
    const body = await req.json();
    const topic = String(body.topic || "").trim();
    const settings = body.settings || {};

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const session = store.createSession({
      entryType: "prompt",
      entryValue: topic
    });
    appLog("info", "page.root_started", { sessionId: session.id });

    const knowledgeContext = await hydraRecallKnowledge({
      sessionId: session.id,
      query: `Return useful context, key concepts, and relationships for a visual explainer about: ${topic}`,
      metadata: {
        app: "visualwiki",
        session_id: session.id,
        type: "root_recall",
        topic
      }
    }).catch(() => "");
    const memoryContext = await hydraRecallMemories({
      sessionId: session.id,
      query: `Return useful session memories and preferences for creating a visual explainer about: ${topic}`,
      metadata: {
        app: "visualwiki",
        session_id: session.id
      }
    }).catch(() => "");
    const hydraContext = [knowledgeContext, memoryContext].filter(Boolean).join("\n\n");

    const plannerPrompt = buildRootPlannerPrompt(
      topic,
      knowledgeContext,
      memoryContext,
      settings
    );
    const plan = await askPlannerForJson({
      prompt: plannerPrompt,
      topic,
      contextLabel: "root"
    });
    appLog("info", "page.root_planned", {
      sessionId: session.id,
      sectionCount: plan.sections.length
    });

    const imagePrompt = buildImagePromptFromPlan({
      topic,
      plan,
      hydraContext,
      mode: "root",
      settings
    });

    const imageUrl = await generateImageFromPrompt(imagePrompt);
    appLog("info", "page.root_image_ready", { sessionId: session.id });

    const page = store.createPage({
      sessionId: session.id,
      parentId: null,
      topic,
      title: plan.title,
      subtitle: plan.subtitle,
      imageUrl,
      imagePrompt,
      hydraContext,
      depth: 0,
      breadcrumbPath: [plan.title]
    });

    const hotspots = createHotspots(page.id, plan.sections);
    store.saveHotspots(hotspots);

    await hydraAddMemory({
      sessionId: session.id,
      text: `User started VisualWiki session with topic: ${topic}`,
      metadata: {
        type: "root_prompt",
        app: "visualwiki",
        session_id: session.id,
        topic,
        depth: 0,
        source: "visualwiki"
      }
    }).catch(() => undefined);

    await hydraWritePage({
      sessionId: session.id,
      pageId: page.id,
      parentPageId: null,
      topic: page.topic,
      title: page.title,
      depth: page.depth,
      breadcrumbPath: page.breadcrumbPath,
      summary: `${page.title}. Sections: ${plan.sections.map((s) => s.label).join(", ")}`
    }).catch(() => undefined);

    return NextResponse.json({
      session,
      page,
      hotspots
    });
  } catch (error: any) {
    appLog("error", "page.root_failed", {
      durationMs: nowMs() - started,
      message: error.message
    });
    return NextResponse.json(
      { error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
