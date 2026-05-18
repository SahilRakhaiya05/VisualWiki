"use client";

import { create } from "zustand";
import {
  DEFAULT_SETTINGS,
  type GraphEdge,
  type Hotspot,
  type Page,
  type PagePayload,
  type Session,
  type VisualWikiSettings
} from "@/types";

type VisualWikiState = {
  session?: Session;
  currentPage?: Page;
  hotspots: Hotspot[];
  edges: GraphEdge[];
  settings: VisualWikiSettings;
  history: Page[];
  loading: boolean;
  error?: string;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  setSettings: (settings: VisualWikiSettings) => void;
  applyPayload: (payload: PagePayload) => void;
  setCurrentPage: (page: Page) => void;
  goBack: () => void;
  clearSession: () => void;
};

export const useVisualWikiStore = create<VisualWikiState>((set, get) => ({
  hotspots: [],
  edges: [],
  settings:
    typeof window === "undefined"
      ? DEFAULT_SETTINGS
      : JSON.parse(
          window.localStorage.getItem("visualwiki-settings") ||
            JSON.stringify(DEFAULT_SETTINGS)
        ),
  history: [],
  loading: false,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSettings: (settings) => {
    window.localStorage.setItem("visualwiki-settings", JSON.stringify(settings));
    set({ settings });
  },

  applyPayload: (payload) =>
    set((state) => {
      const history = state.history.some((page) => page.id === payload.page.id)
        ? state.history.map((page) =>
            page.id === payload.page.id ? payload.page : page
          )
        : [...state.history, payload.page];

      return {
        session: payload.session || state.session,
        currentPage: payload.page,
        hotspots: payload.hotspots,
        edges: payload.edge ? [...state.edges, payload.edge] : state.edges,
        history,
        error: undefined
      };
    }),

  setCurrentPage: (page) => set({ currentPage: page }),

  goBack: () => {
    const current = get().currentPage;
    if (!current?.parentId) return;

    const parent = get().history.find((page) => page.id === current.parentId);
    if (parent) {
      set({ currentPage: parent });
    }
  },

  clearSession: () =>
    set({
      session: undefined,
      currentPage: undefined,
      hotspots: [],
      edges: [],
      history: [],
      error: undefined,
      loading: false
    })
}));
