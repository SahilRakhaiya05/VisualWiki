import { NextResponse } from "next/server";
import { hydraAddMemory } from "@/lib/hydradb";
import { store } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = String(body.sessionId || "");
    const session = store.getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const graph = store.getSessionGraph(sessionId);
    const hotspots = Object.fromEntries(
      graph.pages.map((page) => [page.id, store.getHotspots(page.id)])
    );
    const payload = {
      session,
      settings: body.settings || {},
      pages: graph.pages,
      edges: graph.edges,
      hotspots,
      exportedAt: new Date().toISOString()
    };

    await hydraAddMemory({
      sessionId,
      text: `User exported VisualWiki session as json. Included pages: ${graph.pages.length}.`,
      metadata: {
        type: "export_event",
        app: "visualwiki",
        session_id: sessionId,
        export_type: "json",
        page_count: graph.pages.length
      }
    }).catch(() => undefined);

    return NextResponse.json(payload);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to export JSON" },
      { status: 500 }
    );
  }
}
