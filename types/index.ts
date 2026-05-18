export type Session = {
  id: string;
  userId?: string;
  entryType: "prompt" | "image" | "document" | "url";
  entryValue: string;
  createdAt: string;
};

export type Page = {
  id: string;
  sessionId: string;
  parentId: string | null;
  topic: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imagePrompt: string;
  hydraContext?: string;
  depth: number;
  breadcrumbPath: string[];
  createdAt: string;
};

export type Hotspot = {
  id: string;
  pageId: string;
  label: string;
  description: string;
  bbox: [number, number, number, number];
  nextTopic: string;
};

export type ClickEvent = {
  id: string;
  sessionId: string;
  pageId: string;
  hotspotId: string | null;
  x: number;
  y: number;
  rawX?: number;
  rawY?: number;
  naturalWidth?: number;
  naturalHeight?: number;
  renderedRect?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  clickedLabel: string;
  childPageId: string;
  createdAt: string;
};

export type GraphEdge = {
  id: string;
  sessionId: string;
  fromPageId: string;
  toPageId: string;
  clickedConcept: string;
  x: number;
  y: number;
  createdAt: string;
};

export type VisualPlan = {
  title: string;
  subtitle: string;
  mainScene: string;
  sections: {
    label: string;
    description: string;
    nextTopic: string;
  }[];
  footerCaption: string;
};

export type VisualWikiSettings = {
  style: "Soft Technical Infographic" | "Clean Diagram" | "Storybook Explainer" | "Scientific Plate" | "Minimal Visual Map" | "Premium Magazine Explainer";
  detailLevel: "Simple" | "Balanced" | "Deep" | "Expert";
  textDensity: "Very Low" | "Low" | "Medium";
  clickBehavior: "Fast hotspot mode" | "Smart interpretation mode" | "Ask before diving";
  contextSource: "Session only" | "Uploaded knowledge" | "Global tenant knowledge" | "Session + uploaded + global";
  imageMode: "Generate new visual page" | "Edit uploaded image into visual page" | "Use uploaded image as style reference";
  exportScope: "Current path only" | "Full session";
  includeMetadata: boolean;
  includeClickMap: boolean;
};

export const DEFAULT_SETTINGS: VisualWikiSettings = {
  style: "Soft Technical Infographic",
  detailLevel: "Balanced",
  textDensity: "Low",
  clickBehavior: "Smart interpretation mode",
  contextSource: "Session + uploaded + global",
  imageMode: "Generate new visual page",
  exportScope: "Current path only",
  includeMetadata: true,
  includeClickMap: false
};

export type HydraRecallResult = {
  text: string;
  sources?: unknown[];
  entities?: string[];
  relationships?: unknown[];
};

export type PagePayload = {
  session?: Session;
  page: Page;
  hotspots: Hotspot[];
  edge?: GraphEdge;
};

export type NormalizedClick = {
  x: number;
  y: number;
  rawX: number;
  rawY: number;
  naturalWidth: number;
  naturalHeight: number;
  renderedRect: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
};
