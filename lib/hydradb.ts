type RecallInput = {
  query: string;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, unknown>;
};

type WriteMemoryInput = {
  text: string;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, unknown>;
};

type UploadKnowledgeInput = WriteMemoryInput & {
  sourceName?: string;
  sourceType?: string;
};

const HYDRADB_API_KEY = process.env.HYDRADB_API_KEY;
const HYDRADB_BASE_URL = (
  process.env.HYDRADB_BASE_URL || "https://api.hydradb.com"
).replace(/\/$/, "");
const HYDRADB_TENANT_ID = process.env.HYDRADB_TENANT_ID || "hydra-db-mcp";
const HYDRADB_TIMEOUT_MS = Number(process.env.HYDRADB_TIMEOUT_MS || 10000);

async function fetchHydra(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HYDRADB_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

type HydraChunk = {
  source_title?: string;
  chunk_content?: string;
  content?: string;
  relevancy_score?: number;
  extra_context_ids?: string[];
};

type HydraTriplet = {
  source?: { name?: string };
  target?: { name?: string };
  relation?: {
    canonical_predicate?: string;
    context?: string;
    temporal_details?: string;
  };
};

function formatHydraContext(data: any) {
  const lines: string[] = [];
  const queryPaths = data?.graph_context?.query_paths || [];

  if (Array.isArray(queryPaths) && queryPaths.length) {
    lines.push("ENTITY PATHS");
    for (const path of queryPaths.slice(0, 4)) {
      const triplets = path?.triplets || [];
      for (const triplet of triplets.slice(0, 4) as HydraTriplet[]) {
        const src = triplet.source?.name || "Unknown";
        const tgt = triplet.target?.name || "Unknown";
        const predicate = triplet.relation?.canonical_predicate || "relates to";
        const context = triplet.relation?.context
          ? `: ${triplet.relation.context}`
          : "";
        lines.push(`[${src}] -> ${predicate} -> [${tgt}]${context}`);
      }
    }
  }

  const chunks = data?.chunks || data?.results || [];
  if (Array.isArray(chunks) && chunks.length) {
    lines.push("CONTEXT");
    for (const [index, chunk] of (chunks as HydraChunk[]).slice(0, 5).entries()) {
      const source = chunk.source_title ? `Source: ${chunk.source_title}` : "";
      const content = chunk.chunk_content || chunk.content || JSON.stringify(chunk);
      lines.push(`Chunk ${index + 1}`);
      if (source) lines.push(source);
      lines.push(String(content).slice(0, 900));
    }
  }

  if (!lines.length) return JSON.stringify(data).slice(0, 4000);
  return lines.join("\n").slice(0, 4000);
}

export async function hydraRecall(input: RecallInput): Promise<string> {
  if (!HYDRADB_API_KEY) return "";
  const started = nowMs();

  try {
    const response = await fetchHydra(`${HYDRADB_BASE_URL}/recall/full_recall`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HYDRADB_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tenant_id: HYDRADB_TENANT_ID,
        sub_tenant_id: input.userId || input.sessionId,
        query: input.query,
        max_results: 5,
        mode: "fast",
        alpha: 0.8,
        recency_bias: 0,
        graph_context: true,
        search_forceful_relations: true,
        metadata_filters: input.metadata || {}
      })
    });

    if (!response.ok) {
      appLog("warn", "hydra.recall_non_ok", {
        sessionId: input.sessionId,
        status: response.status,
        durationMs: nowMs() - started
      });
      return "";
    }
    const text = formatHydraContext(await response.json());
    appLog("info", "hydra.recall_ok", {
      sessionId: input.sessionId,
      chars: text.length,
      durationMs: nowMs() - started
    });
    return text;
  } catch (error: any) {
    appLog("warn", "hydra.recall_failed", {
      sessionId: input.sessionId,
      message: error.message,
      durationMs: nowMs() - started
    });
    return "";
  }
}

export async function hydraWriteMemory(input: WriteMemoryInput): Promise<void> {
  if (!HYDRADB_API_KEY) return;
  const started = nowMs();

  await fetchHydra(`${HYDRADB_BASE_URL}/memories/add_memory`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HYDRADB_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      tenant_id: HYDRADB_TENANT_ID,
      sub_tenant_id: input.userId || input.sessionId,
      upsert: true,
      memories: [
        {
          text: input.text,
          infer: false,
          title: String(input.metadata?.type || "visualwiki_memory"),
          metadata: input.metadata || {}
        }
      ]
    })
  })
    .then((response) => {
      appLog(response.ok ? "info" : "warn", "hydra.memory_write", {
        sessionId: input.sessionId,
        status: response.status,
        durationMs: nowMs() - started
      });
    })
    .catch((error) => {
      appLog("warn", "hydra.memory_write_failed", {
        sessionId: input.sessionId,
        message: error.message,
        durationMs: nowMs() - started
      });
    });
}

export async function hydraWriteKnowledge(input: WriteMemoryInput) {
  await hydraWriteMemory({
    ...input,
    metadata: { ...input.metadata, type: input.metadata?.type || "knowledge" }
  });
}

export async function hydraAddMemory(input: WriteMemoryInput) {
  await hydraWriteMemory(input);
}

export async function hydraUploadKnowledge(input: UploadKnowledgeInput) {
  await hydraWriteKnowledge({
    ...input,
    metadata: {
      type: "uploaded_knowledge",
      app: "visualwiki",
      session_id: input.sessionId,
      source_name: input.sourceName || input.metadata?.source_name,
      source_type: input.sourceType || input.metadata?.source_type,
      ...input.metadata
    }
  });
}

export async function hydraRecallKnowledge(input: RecallInput) {
  return hydraRecall({
    ...input,
    metadata: {
      app: "visualwiki",
      session_id: input.sessionId,
      ...input.metadata
    }
  });
}

export async function hydraRecallMemories(input: RecallInput) {
  return hydraRecall({
    ...input,
    metadata: {
      app: "visualwiki",
      session_id: input.sessionId,
      ...input.metadata
    }
  });
}

export async function hydraWritePreference(input: WriteMemoryInput) {
  await hydraWriteMemory({
    ...input,
    metadata: { ...input.metadata, type: input.metadata?.type || "preference" }
  });
}

export async function hydraWritePage(input: {
  sessionId: string;
  pageId: string;
  parentPageId?: string | null;
  topic: string;
  title: string;
  depth: number;
  breadcrumbPath: string[];
  summary: string;
}) {
  await hydraWriteMemory({
    sessionId: input.sessionId,
    text: `
Generated visual page:
Title: ${input.title}
Topic: ${input.topic}
Depth: ${input.depth}
Breadcrumb: ${input.breadcrumbPath.join(" > ")}
Summary: ${input.summary}
`.trim(),
    metadata: {
      type: "generated_page",
      app: "visualwiki",
      session_id: input.sessionId,
      page_id: input.pageId,
      parent_page_id: input.parentPageId,
      topic: input.topic,
      title: input.title,
      depth: input.depth,
      breadcrumb_path: input.breadcrumbPath.join(" > "),
      source: "visualwiki"
    }
  });
}

export async function hydraWriteClick(input: {
  sessionId: string;
  pageId: string;
  childPageId: string;
  clickedLabel: string;
  nextTopic?: string;
  pageTitle?: string;
  depth?: number;
  x: number;
  y: number;
}) {
  await hydraWriteMemory({
    sessionId: input.sessionId,
    text: `
User clicked ${input.clickedLabel} inside page ${input.pageTitle || input.pageId}.
Coordinates x=${input.x}, y=${input.y}.
Generated next topic ${input.nextTopic || input.clickedLabel}.
Generated child page ${input.childPageId}.
Click position: ${input.x}, ${input.y}.
`.trim(),
    metadata: {
      type: "click_event",
      app: "visualwiki",
      session_id: input.sessionId,
      page_id: input.pageId,
      child_page_id: input.childPageId,
      clicked_label: input.clickedLabel,
      clicked_concept: input.clickedLabel,
      next_topic: input.nextTopic,
      depth: input.depth,
      x: input.x,
      y: input.y,
      source: "visualwiki"
    }
  });
}

export async function hydraWriteSessionSummary(input: {
  sessionId: string;
  title: string;
  summary: string;
  breadcrumbPath?: string[];
}) {
  await hydraWriteMemory({
    sessionId: input.sessionId,
    text: input.summary,
    metadata: {
      type: "session_summary",
      app: "visualwiki",
      session_id: input.sessionId,
      title: input.title,
      breadcrumb_path: input.breadcrumbPath?.join(" > ") || ""
    }
  });
}
import { appLog, nowMs } from "@/lib/app-log";
