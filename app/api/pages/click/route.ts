import { NextResponse } from "next/server";
import { askChatPlanner } from "@/lib/chat-api";
import { appLog, nowMs } from "@/lib/app-log";
import { buildClickInterpreterPrompt } from "@/lib/click-prompts";
import { generateImageFromPrompt } from "@/lib/image-api";
import { buildImagePromptFromPlan } from "@/lib/image-prompts";
import { parseLooseJson } from "@/lib/parse-json";
import { askPlannerForJson } from "@/lib/planner-service";
import { buildChildPlannerPrompt } from "@/lib/planner-prompts";
import {
  createHotspots,
  findDirectHotspot,
  findHotspotByClick,
  findNearestHotspot
} from "@/lib/hotspots";
import { store } from "@/lib/store";
import {
  hydraRecallKnowledge,
  hydraRecallMemories,
  hydraWriteClick,
  hydraWritePage
} from "@/lib/hydradb";

export const maxDuration = 300;

export async function POST(req: Request) {
  const started = nowMs();
  try {
    const body = await req.json();
    const settings = body.settings || {};
    const pageId = String(body.pageId || "");
    const x = Number(body.x);
    const y = Number(body.y);
    const rawX = Number(body.rawX);
    const rawY = Number(body.rawY);

    if (!pageId || Number.isNaN(x) || Number.isNaN(y)) {
      return NextResponse.json(
        { error: "pageId, x, and y are required" },
        { status: 400 }
      );
    }

    const parentPage = store.getPage(pageId);

    if (!parentPage) {
      return NextResponse.json({ error: "Parent page not found" }, { status: 404 });
    }
    appLog("info", "page.click_started", {
      sessionId: parentPage.sessionId,
      pageId,
      x,
      y
    });

    const parentHotspots = store.getHotspots(pageId);

    if (!parentHotspots.length) {
      return NextResponse.json({ error: "No hotspots found" }, { status: 404 });
    }

    const directHotspot = findDirectHotspot(parentHotspots, x, y);
    const nearest = findNearestHotspot(parentHotspots, x, y);
    let clickedHotspot = directHotspot || findHotspotByClick(parentHotspots, x, y);
    let clickedConcept = clickedHotspot.label;
    let nextTopic = clickedHotspot.nextTopic;
    let loadingMessage = `Fetching information about ${clickedConcept}...`;

    const shouldInterpret =
      settings.clickBehavior === "Smart interpretation mode" &&
      (!directHotspot || clickedHotspot === parentHotspots[2] || nearest.distance > 0.18);

    if (shouldInterpret) {
      const interpretation = await askChatPlanner(
        buildClickInterpreterPrompt({
          page: parentPage,
          hotspots: parentHotspots,
          x,
          y
        })
      )
        .then((reply) =>
          parseLooseJson<{
            clickedConcept?: string;
            nextTopic?: string;
            confidence?: number;
            loadingMessage?: string;
          }>(reply)
        )
        .catch(() => null);

      if (interpretation?.clickedConcept && (interpretation.confidence || 0) >= 0.45) {
        clickedConcept = interpretation.clickedConcept;
        nextTopic = interpretation.nextTopic || clickedHotspot.nextTopic;
        loadingMessage =
          interpretation.loadingMessage ||
          `Fetching information about ${clickedConcept}...`;
      }
    }

    const breadcrumbPath = [...parentPage.breadcrumbPath, clickedConcept];

    const knowledgeContext = await hydraRecallKnowledge({
      sessionId: parentPage.sessionId,
      query: `The user clicked "${clickedConcept}" inside "${parentPage.topic}". Return deeper context and visual concepts for "${nextTopic}".`,
      metadata: {
        app: "visualwiki",
        type: "click_recall",
        session_id: parentPage.sessionId,
        parent_page_id: parentPage.id,
        clicked_label: clickedConcept,
        next_topic: nextTopic
      }
    }).catch(() => "");
    const memoryContext = await hydraRecallMemories({
      sessionId: parentPage.sessionId,
      query: `Return session memories connected to breadcrumb path "${breadcrumbPath.join(" > ")}" and clicked concept "${clickedConcept}".`,
      metadata: {
        app: "visualwiki",
        session_id: parentPage.sessionId
      }
    }).catch(() => "");
    const hydraContext = [knowledgeContext, memoryContext].filter(Boolean).join("\n\n");

    const plannerPrompt = buildChildPlannerPrompt({
      parentTopic: parentPage.topic,
      clickedLabel: clickedConcept,
      nextTopic,
      breadcrumbPath,
      hydraContext,
      knowledgeContext,
      memoryContext,
      settings
    });

    const plan = await askPlannerForJson({
      prompt: plannerPrompt,
      topic: nextTopic,
      contextLabel: "child"
    });
    appLog("info", "page.click_planned", {
      sessionId: parentPage.sessionId,
      clickedConcept,
      sectionCount: plan.sections.length
    });

    const imagePrompt = buildImagePromptFromPlan({
      topic: nextTopic,
      plan,
      hydraContext,
      mode: "child",
      settings
    });

    const imageUrl = await generateImageFromPrompt(imagePrompt);
    appLog("info", "page.click_image_ready", {
      sessionId: parentPage.sessionId,
      clickedConcept
    });

    const childPage = store.createPage({
      sessionId: parentPage.sessionId,
      parentId: parentPage.id,
      topic: nextTopic,
      title: plan.title,
      subtitle: plan.subtitle,
      imageUrl,
      imagePrompt,
      hydraContext,
      depth: parentPage.depth + 1,
      breadcrumbPath
    });

    const childHotspots = createHotspots(childPage.id, plan.sections);
    store.saveHotspots(childHotspots);

    const click = store.createClick({
      sessionId: parentPage.sessionId,
      pageId: parentPage.id,
      hotspotId: clickedHotspot.id,
      x,
      y,
      rawX: Number.isNaN(rawX) ? undefined : rawX,
      rawY: Number.isNaN(rawY) ? undefined : rawY,
      naturalWidth: Number(body.naturalWidth) || undefined,
      naturalHeight: Number(body.naturalHeight) || undefined,
      renderedRect: body.renderedRect,
      clickedLabel: clickedConcept,
      childPageId: childPage.id
    });

    const edge = store.createEdge({
      sessionId: parentPage.sessionId,
      fromPageId: parentPage.id,
      toPageId: childPage.id,
      clickedConcept,
      x,
      y
    });

    await hydraWriteClick({
      sessionId: parentPage.sessionId,
      pageId: parentPage.id,
      childPageId: childPage.id,
      clickedLabel: clickedConcept,
      nextTopic,
      pageTitle: parentPage.title,
      depth: childPage.depth,
      x,
      y
    }).catch(() => undefined);

    await hydraWritePage({
      sessionId: childPage.sessionId,
      pageId: childPage.id,
      parentPageId: parentPage.id,
      topic: childPage.topic,
      title: childPage.title,
      depth: childPage.depth,
      breadcrumbPath: childPage.breadcrumbPath,
      summary: `${childPage.title}. Sections: ${plan.sections.map((s) => s.label).join(", ")}`
    }).catch(() => undefined);

    return NextResponse.json({
      clicked: {
        label: clickedConcept,
        nextTopic,
        loadingMessage
      },
      page: childPage,
      hotspots: childHotspots,
      edge,
      click
    });
  } catch (error: any) {
    appLog("error", "page.click_failed", {
      durationMs: nowMs() - started,
      message: error.message
    });
    return NextResponse.json(
      { error: error.message || "Failed to generate child image" },
      { status: 500 }
    );
  }
}
