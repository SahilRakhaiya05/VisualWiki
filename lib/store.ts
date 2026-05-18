import type { ClickEvent, GraphEdge, Hotspot, Page, Session } from "@/types";
import { createId } from "@/lib/id";

type CreateSessionInput = Pick<Session, "entryType" | "entryValue"> & {
  userId?: string;
};

type CreatePageInput = Omit<Page, "id" | "createdAt">;
type CreateClickInput = Omit<ClickEvent, "id" | "createdAt">;
type CreateEdgeInput = Omit<GraphEdge, "id" | "createdAt">;

type StoreMaps = {
  sessions: Map<string, Session>;
  pages: Map<string, Page>;
  hotspots: Map<string, Hotspot[]>;
  clicks: Map<string, ClickEvent>;
  edges: Map<string, GraphEdge>;
};

const globalStore = globalThis as typeof globalThis & {
  __visualWikiStore?: StoreMaps;
};

const maps =
  globalStore.__visualWikiStore ||
  (globalStore.__visualWikiStore = {
    sessions: new Map<string, Session>(),
    pages: new Map<string, Page>(),
    hotspots: new Map<string, Hotspot[]>(),
    clicks: new Map<string, ClickEvent>(),
    edges: new Map<string, GraphEdge>()
  });

const { sessions, pages, hotspots, clicks, edges } = maps;

export const store = {
  createSession(input: CreateSessionInput) {
    const session: Session = {
      id: createId("session"),
      userId: input.userId,
      entryType: input.entryType,
      entryValue: input.entryValue,
      createdAt: new Date().toISOString()
    };

    sessions.set(session.id, session);
    return session;
  },

  getSession(sessionId: string) {
    return sessions.get(sessionId);
  },

  getSessionPages(sessionId: string) {
    return [...pages.values()]
      .filter((page) => page.sessionId === sessionId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  createPage(input: CreatePageInput) {
    const page: Page = {
      ...input,
      id: createId("page"),
      createdAt: new Date().toISOString()
    };

    pages.set(page.id, page);
    return page;
  },

  updatePage(page: Page) {
    pages.set(page.id, page);
    return page;
  },

  getPage(pageId: string) {
    return pages.get(pageId);
  },

  saveHotspots(input: Hotspot[]) {
    if (!input[0]) return;
    hotspots.set(input[0].pageId, input);
  },

  getHotspots(pageId: string) {
    return hotspots.get(pageId) || [];
  },

  createClick(input: CreateClickInput) {
    const click: ClickEvent = {
      ...input,
      id: createId("click"),
      createdAt: new Date().toISOString()
    };

    clicks.set(click.id, click);
    return click;
  },

  createEdge(input: CreateEdgeInput) {
    const edge: GraphEdge = {
      ...input,
      id: createId("edge"),
      createdAt: new Date().toISOString()
    };

    edges.set(edge.id, edge);
    return edge;
  },

  getSessionClicks(sessionId: string) {
    return [...clicks.values()]
      .filter((click) => click.sessionId === sessionId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  getSessionEdges(sessionId: string) {
    return [...edges.values()]
      .filter((edge) => edge.sessionId === sessionId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  getPathToPage(pageId: string) {
    const path: Page[] = [];
    let current = pages.get(pageId);

    while (current) {
      path.unshift(current);
      current = current.parentId ? pages.get(current.parentId) : undefined;
    }

    return path;
  },

  getSessionGraph(sessionId: string) {
    return {
      pages: this.getSessionPages(sessionId),
      edges: this.getSessionEdges(sessionId),
      clicks: this.getSessionClicks(sessionId)
    };
  }
};
