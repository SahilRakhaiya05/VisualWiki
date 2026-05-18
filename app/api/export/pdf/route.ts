import { NextResponse } from "next/server";
import { buildBookPdf, buildSessionJson } from "@/lib/export-book";
import { hydraAddMemory } from "@/lib/hydradb";
import { store } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = String(body.sessionId || "");
    const pageId = body.pageId ? String(body.pageId) : "";
    const format = String(body.format || "pdf");
    const scope = String(body.scope || "session");
    const session = store.getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const graph = store.getSessionGraph(sessionId);
    const pages =
      scope === "path" && pageId ? store.getPathToPage(pageId) : graph.pages;

    await hydraAddMemory({
      sessionId,
      text: `User exported VisualWiki session as ${format}. Included pages: ${pages.length}.`,
      metadata: {
        type: "export_event",
        app: "visualwiki",
        session_id: sessionId,
        export_type: format,
        page_count: pages.length
      }
    }).catch(() => undefined);

    if (format === "json") {
      return new NextResponse(
        buildSessionJson({ session, pages, edges: graph.edges }),
        {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="${session.id}.json"`
          }
        }
      );
    }

    const pdf = buildBookPdf({ session, pages, edges: graph.edges });
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${session.id}.pdf"`
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to export book" },
      { status: 500 }
    );
  }
}
