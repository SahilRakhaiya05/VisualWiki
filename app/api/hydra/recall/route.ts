import { NextResponse } from "next/server";
import { hydraRecall } from "@/lib/hydradb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = String(body.query || "").trim();
    const sessionId = String(body.sessionId || "debug");

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const text = await hydraRecall({
      sessionId,
      query,
      metadata: body.metadata || {}
    });

    return NextResponse.json({ text });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to recall context" },
      { status: 500 }
    );
  }
}
