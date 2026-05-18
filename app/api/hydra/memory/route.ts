import { NextResponse } from "next/server";
import { hydraAddMemory } from "@/lib/hydradb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = String(body.sessionId || "");
    const text = String(body.text || "").trim();

    if (!sessionId || !text) {
      return NextResponse.json(
        { error: "sessionId and text are required" },
        { status: 400 }
      );
    }

    await hydraAddMemory({
      sessionId,
      text,
      metadata: {
        type: "manual_memory",
        app: "visualwiki",
        session_id: sessionId,
        ...(body.metadata || {})
      }
    }).catch(() => undefined);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to write memory" },
      { status: 500 }
    );
  }
}
