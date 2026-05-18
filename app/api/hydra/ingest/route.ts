import { NextResponse } from "next/server";
import { hydraUploadKnowledge } from "@/lib/hydradb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = String(body.sessionId || "global");
    const text = String(body.text || "").trim();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    await hydraUploadKnowledge({
      sessionId,
      text,
      sourceName: body.fileName || "manual-ingest",
      sourceType: body.mimeType || "text/plain",
      metadata: {
        type: "uploaded_source",
        app: "visualwiki",
        session_id: sessionId,
        file_name: body.fileName || "manual-ingest",
        mime_type: body.mimeType || "text/plain",
        source: "upload"
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to ingest context" },
      { status: 500 }
    );
  }
}
