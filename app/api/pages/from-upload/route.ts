import { NextResponse } from "next/server";
import { generateImageFromPrompt } from "@/lib/image-api";
import { buildImagePromptFromPlan } from "@/lib/image-prompts";
import { askPlannerForJson } from "@/lib/planner-service";
import { buildUploadedImagePlannerPrompt } from "@/lib/planner-prompts";
import { appLog, nowMs } from "@/lib/app-log";
import { createHotspots } from "@/lib/hotspots";
import {
  hydraRecallKnowledge,
  hydraRecallMemories,
  hydraUploadKnowledge,
  hydraWritePage
} from "@/lib/hydradb";
import { store } from "@/lib/store";
import { validateImageUpload } from "@/lib/upload-validation";

export const maxDuration = 300;

export async function POST(req: Request) {
  const started = nowMs();
  try {
    const form = await req.formData();
    const file = form.get("file");
    const instruction = String(form.get("instruction") || "").trim();
    const mode = String(form.get("mode") || "explain") as
      | "explain"
      | "style-reference";
    const settingsRaw = String(form.get("settings") || "{}");
    const settings = JSON.parse(settingsRaw);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    const validationError = validateImageUpload(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (!instruction) {
      return NextResponse.json(
        {
          error:
            "Describe what this image shows so VisualWiki can make it explorable."
        },
        { status: 400 }
      );
    }

    const session = store.createSession({
      entryType: "image",
      entryValue: instruction
    });

    const analyzeForm = new FormData();
    analyzeForm.set("file", file);
    analyzeForm.set("mode", mode);
    analyzeForm.set("instruction", instruction);

    const analyzeResponse = await fetch(new URL("/api/image/analyze", req.url), {
      method: "POST",
      body: analyzeForm
    });
    const analysis = await analyzeResponse.json();

    if (!analyzeResponse.ok) {
      return NextResponse.json(
        { error: analysis.error || "Image analysis failed" },
        { status: analyzeResponse.status }
      );
    }

    await hydraUploadKnowledge({
      sessionId: session.id,
      text: `Uploaded image summary: ${analysis.summary}. Detected elements: ${(analysis.visualElements || []).join(", ")}.`,
      sourceName: file.name,
      sourceType: "image",
      metadata: {
        type: "uploaded_image_knowledge",
        app: "visualwiki",
        session_id: session.id,
        source_type: "image",
        mode,
        detected_title: analysis.detectedTitle
      }
    }).catch(() => undefined);

    const query = `Return useful context related to this uploaded image summary: "${analysis.summary}". Include known entities, relationships, prior session context, user preferences, and possible visual sections.`;
    const knowledgeContext = await hydraRecallKnowledge({
      sessionId: session.id,
      query,
      metadata: {
        app: "visualwiki",
        session_id: session.id
      }
    }).catch(() => "");
    const memoryContext = await hydraRecallMemories({
      sessionId: session.id,
      query,
      metadata: {
        app: "visualwiki",
        session_id: session.id
      }
    }).catch(() => "");
    const hydraContext = [knowledgeContext, memoryContext].filter(Boolean).join("\n\n");

    const plannerPrompt = buildUploadedImagePlannerPrompt({
      mode,
      userInstruction: instruction,
      imageSummary: analysis.summary,
      visualElements: analysis.visualElements,
      hydraContext,
      settings
    });
    const plan = await askPlannerForJson({
      prompt: plannerPrompt,
      topic: analysis.detectedTitle || instruction,
      contextLabel: "upload"
    });
    const topic = analysis.detectedTitle || plan.title || instruction;
    const imagePrompt = buildImagePromptFromPlan({
      topic,
      plan,
      hydraContext,
      mode: "root",
      settings
    });
    const imageUrl = await generateImageFromPrompt(imagePrompt);

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

    await hydraWritePage({
      sessionId: session.id,
      pageId: page.id,
      parentPageId: null,
      topic: page.topic,
      title: page.title,
      depth: page.depth,
      breadcrumbPath: page.breadcrumbPath,
      summary: `${page.title}. Sections: ${plan.sections.map((section) => section.label).join(", ")}`
    }).catch(() => undefined);

    appLog("info", "page.from_upload.generated", {
      sessionId: session.id,
      pageId: page.id,
      durationMs: nowMs() - started
    });

    return NextResponse.json({ session, page, hotspots, analysis });
  } catch (error: any) {
    appLog("error", "page.from_upload_failed", {
      durationMs: nowMs() - started,
      message: error.message
    });
    return NextResponse.json(
      { error: error.message || "Failed to generate from upload" },
      { status: 500 }
    );
  }
}
