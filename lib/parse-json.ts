export { parsePlannerJson as parseJson } from "@/lib/parse-planner-json";
export { parsePlannerJson } from "@/lib/parse-planner-json";

export function parseLooseJson<T = any>(reply: string): T {
  let text = reply
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  const start = text.indexOf("{");
  if (start !== -1) text = text.slice(start);

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0 && char === "}") {
      text = text.slice(0, index + 1);
      break;
    }
  }

  return JSON.parse(text) as T;
}
