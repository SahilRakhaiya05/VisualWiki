type LogLevel = "info" | "warn" | "error";

const ENABLED = process.env.VISUALWIKI_LOGS !== "false";

function sanitize(value: unknown): unknown {
  if (value === undefined || value === null) return value;
  if (typeof value === "string") {
    if (/key|token|secret|bearer|http/i.test(value)) return "[redacted]";
    return value.slice(0, 180);
  }
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.slice(0, 8).map(sanitize);

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      /key|token|secret|authorization|url|prompt/i.test(key)
        ? "[redacted]"
        : sanitize(entry)
    ])
  );
}

export function appLog(
  level: LogLevel,
  event: string,
  details: Record<string, unknown> = {}
) {
  if (!ENABLED) return;
  const cleanDetails = sanitize(details) as Record<string, unknown>;
  const payload = {
    at: new Date().toISOString(),
    event,
    ...cleanDetails
  };
  const line = `[visualwiki] ${JSON.stringify(payload)}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export function nowMs() {
  return Date.now();
}
