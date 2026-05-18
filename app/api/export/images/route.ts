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

    const pages = store.getSessionPages(sessionId);

    await hydraAddMemory({
      sessionId,
      text: `User exported VisualWiki session image list. Included pages: ${pages.length}.`,
      metadata: {
        type: "export_event",
        app: "visualwiki",
        session_id: sessionId,
        export_type: "images",
        page_count: pages.length
      }
    }).catch(() => undefined);

    return NextResponse.json({
      images: pages.map((page) => ({
        pageId: page.id,
        title: page.title,
        imageUrl: page.imageUrl,
        createdAt: page.createdAt
      }))
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to export images" },
      { status: 500 }
    );
  }
}
