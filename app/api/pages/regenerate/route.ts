import { NextResponse } from "next/server";
import { appLog, nowMs } from "@/lib/app-log";
import { generateImageFromPrompt } from "@/lib/image-api";
import { buildImagePromptFromPlan } from "@/lib/image-prompts";
import { askPlannerForJson } from "@/lib/planner-service";
import {
  buildChildPlannerPrompt,
  buildRootPlannerPrompt
} from "@/lib/planner-prompts";
import { createHotspots } from "@/lib/hotspots";
import { store } from "@/lib/store";
import {
  hydraRecallKnowledge,
  hydraRecallMemories,
  hydraWritePage
} from "@/lib/hydradb";

export const maxDuration = 300;

export async function POST(req: Request) {
  const started = nowMs();
  try {
    const body = await req.json();
    const settings = body.settings || {};
    const pageId = String(body.pageId || "");
    const page = store.getPage(pageId);

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    appLog("info", "page.regenerate_started", {
      sessionId: page.sessionId,
      pageId
    });

    const knowledgeContext = await hydraRecallKnowledge({
      sessionId: page.sessionId,
      query: `Regenerate a clearer visual explainer for "${page.topic}". Return useful context, relationships, and visual details.`,
      metadata: {
        app: "visualwiki",
        type: "regenerate_recall",
        session_id: page.sessionId,
        page_id: page.id,
        topic: page.topic
      }
    }).catch(() => "");
    const memoryContext = await hydraRecallMemories({
      sessionId: page.sessionId,
      query: `Return session memory relevant to regenerating "${page.topic}" along "${page.breadcrumbPath.join(" > ")}".`,
      metadata: {
        app: "visualwiki",
        session_id: page.sessionId
      }
    }).catch(() => "");
    const hydraContext = [knowledgeContext, memoryContext].filter(Boolean).join("\n\n");

    const parent = page.parentId ? store.getPage(page.parentId) : null;
    const plannerPrompt = parent
      ? buildChildPlannerPrompt({
          parentTopic: parent.topic,
          clickedLabel: page.title,
          nextTopic: page.topic,
          breadcrumbPath: page.breadcrumbPath,
          hydraContext,
          knowledgeContext,
          memoryContext,
          settings
        })
      : buildRootPlannerPrompt(page.topic, knowledgeContext, memoryContext, settings);

    const plan = await askPlannerForJson({
      prompt: plannerPrompt,
      topic: page.topic,
      contextLabel: "regenerate"
    });

    const imagePrompt = buildImagePromptFromPlan({
      topic: page.topic,
      plan,
      hydraContext,
      mode: parent ? "child" : "root",
      settings
    });

    const imageUrl = await generateImageFromPrompt(imagePrompt);
    appLog("info", "page.regenerate_image_ready", {
      sessionId: page.sessionId,
      pageId
    });

    const updatedPage = store.updatePage({
      ...page,
      title: plan.title,
      subtitle: plan.subtitle,
      imageUrl,
      imagePrompt,
      hydraContext,
      breadcrumbPath:
        page.depth === 0
          ? [plan.title]
          : [...page.breadcrumbPath.slice(0, -1), plan.title]
    });

    const hotspots = createHotspots(updatedPage.id, plan.sections);
    store.saveHotspots(hotspots);

    await hydraWritePage({
      sessionId: updatedPage.sessionId,
      pageId: updatedPage.id,
      parentPageId: updatedPage.parentId,
      topic: updatedPage.topic,
      title: updatedPage.title,
      depth: updatedPage.depth,
      breadcrumbPath: updatedPage.breadcrumbPath,
      summary: `${updatedPage.title}. Sections: ${plan.sections.map((s) => s.label).join(", ")}`
    }).catch(() => undefined);

    return NextResponse.json({ page: updatedPage, hotspots });
  } catch (error: any) {
    appLog("error", "page.regenerate_failed", {
      durationMs: nowMs() - started,
      message: error.message
    });
    return NextResponse.json(
      { error: error.message || "Failed to regenerate image" },
      { status: 500 }
    );
  }
}
