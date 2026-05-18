import type { Hotspot, VisualPlan } from "@/types";
import { createId } from "@/lib/id";

const BOXES: [number, number, number, number][] = [
  [0.05, 0.18, 0.3, 0.52],
  [0.7, 0.18, 0.95, 0.52],
  [0.3, 0.18, 0.7, 0.62],
  [0.06, 0.64, 0.27, 0.9],
  [0.28, 0.64, 0.49, 0.9],
  [0.5, 0.64, 0.71, 0.9],
  [0.72, 0.64, 0.94, 0.9]
];

export function createHotspots(
  pageId: string,
  sections: VisualPlan["sections"]
): Hotspot[] {
  return BOXES.map((bbox, index) => {
    const section = sections[index] || {
      label: `Detail ${index + 1}`,
      description: "Explore this detail",
      nextTopic: `Detail ${index + 1}`
    };

    return {
      id: createId("hotspot"),
      pageId,
      label: section.label,
      description: section.description,
      bbox,
      nextTopic: section.nextTopic
    };
  });
}

export function findHotspotByClick(
  hotspots: Hotspot[],
  x: number,
  y: number
): Hotspot {
  const direct = findDirectHotspot(hotspots, x, y);

  if (direct) return direct;

  return findNearestHotspot(hotspots, x, y).hotspot;
}

export function findDirectHotspot(
  hotspots: Hotspot[],
  x: number,
  y: number
) {
  return hotspots.find((h) => {
    const [x1, y1, x2, y2] = h.bbox;
    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  });
}

export function findNearestHotspot(hotspots: Hotspot[], x: number, y: number) {
  return hotspots
    .map((h) => {
      const [x1, y1, x2, y2] = h.bbox;
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const distance = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      return { hotspot: h, distance };
    })
    .sort((a, b) => a.distance - b.distance)[0];
}
