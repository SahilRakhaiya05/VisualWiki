import { NextResponse } from "next/server";
import { appLog, nowMs } from "@/lib/app-log";
import { hydraAddMemory } from "@/lib/hydradb";

export async function POST(req: Request) {
  const started = nowMs();
  try {
    const body = await req.json();
    const sessionId = String(body.sessionId || "local");
    const settings = body.settings || {};

    await hydraAddMemory({
      sessionId,
      text: `User changed VisualWiki settings: style=${settings.style}, detail=${settings.detailLevel}, textDensity=${settings.textDensity}, clickBehavior=${settings.clickBehavior}.`,
      metadata: {
        type: "settings_change",
        app: "visualwiki",
        session_id: sessionId,
        style: settings.style,
        detail_level: settings.detailLevel,
        text_density: settings.textDensity,
        click_behavior: settings.clickBehavior
      }
    }).catch(() => undefined);

    appLog("info", "settings.saved", {
      sessionId,
      durationMs: nowMs() - started
    });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    appLog("error", "settings.save_failed", {
      durationMs: nowMs() - started,
      message: error.message
    });
    return NextResponse.json(
      { error: error.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}
