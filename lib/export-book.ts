import type { GraphEdge, Page, Session } from "@/types";

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function pdfLine(text: string, x: number, y: number, size = 12) {
  return `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`;
}

export function buildSessionJson(input: {
  session: Session;
  pages: Page[];
  edges: GraphEdge[];
}) {
  return JSON.stringify(input, null, 2);
}

export function buildBookPdf(input: {
  session: Session;
  pages: Page[];
  edges: GraphEdge[];
}) {
  const lines = [
    pdfLine(`VisualWiki Book: ${input.session.entryValue}`, 48, 770, 20),
    pdfLine(`Session: ${input.session.id}`, 48, 742),
    ...input.pages.flatMap((page, index) => [
      pdfLine(`${index + 1}. ${page.title}`, 48, 700 - index * 72, 14),
      pdfLine(`Path: ${page.breadcrumbPath.join(" > ")}`, 64, 680 - index * 72, 10),
      pdfLine(`Image: ${page.imageUrl}`, 64, 664 - index * 72, 8)
    ]),
    pdfLine(`Edges: ${input.edges.length}`, 48, 80, 10)
  ];
  const content = lines.join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${Buffer.byteLength(content)} >> stream\n${content}\nendstream endobj`
  ];

  let offset = "%PDF-1.4\n".length;
  const xref = ["0000000000 65535 f "];
  const body = objects
    .map((object) => {
      xref.push(`${String(offset).padStart(10, "0")} 00000 n `);
      offset += object.length + 1;
      return object;
    })
    .join("\n");
  const xrefStart = offset;

  return Buffer.from(
    `%PDF-1.4\n${body}\nxref\n0 ${xref.length}\n${xref.join("\n")}\ntrailer << /Size ${xref.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  );
}
