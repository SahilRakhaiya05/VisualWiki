"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { PagePayload } from "@/types";
import { ErrorState } from "@/components/ErrorState";
import { HistorySidebar } from "@/components/HistorySidebar";
import { ImageStage } from "@/components/ImageStage";
import { PageActions } from "@/components/PageActions";
import { PromptComposer } from "@/components/PromptComposer";
import { SettingsButton } from "@/components/SettingsButton";
import { SettingsPanel } from "@/components/SettingsPanel";
import { TopBar } from "@/components/TopBar";
import { VisualBrowserFrame } from "@/components/VisualBrowserFrame";
import { ToastProvider } from "@/components/ToastProvider";
import { useVisualWikiStore } from "@/lib/client-store";

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data as T;
}

export function AppShell() {
  const [topic, setTopic] = useState("");
  const [lastAction, setLastAction] = useState<null | (() => Promise<void>)>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [hydraStatus, setHydraStatus] = useState<"connected" | "local">("local");
  const {
    currentPage,
    session,
    history,
    edges,
    settings,
    loading,
    error,
    applyPayload,
    setSettings,
    setCurrentPage,
    setLoading,
    setError,
    goBack,
    clearSession
  } = useVisualWikiStore();
  const promptRef = useRef<HTMLTextAreaElement | null>(null);

  async function generateRoot() {
    if (!topic.trim() || loading) return;

    setLoading(true);
    setError(undefined);
    setLastAction(() => generateRoot);

    try {
      const payload = await readJson<PagePayload>(
        await fetch("/api/pages/root", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, settings })
        })
      );
      applyPayload(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to generate page");
    } finally {
      setLoading(false);
    }
  }

  async function generateChild(input: {
    pageId: string;
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
  }) {
    if (loading) return;

    setLoading(true);
    setError(undefined);
    setLastAction(() => async () => generateChild(input));

    try {
      const payload = await readJson<PagePayload>(
        await fetch("/api/pages/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...input, settings })
        })
      );
      applyPayload(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to generate child page");
    } finally {
      setLoading(false);
    }
  }

  async function regenerate() {
    if (!currentPage || loading) return;

    setLoading(true);
    setError(undefined);
    setLastAction(() => regenerate);

    try {
      const payload = await readJson<PagePayload>(
        await fetch("/api/pages/regenerate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId: currentPage.id, settings })
        })
      );
      applyPayload(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to regenerate page");
    } finally {
      setLoading(false);
    }
  }

  async function generateFromImage(file: File, instruction: string) {
    if (loading) return;
    setLoading(true);
    setError(undefined);
    setToast("Analyzing uploaded image...");
    setLastAction(() => async () => generateFromImage(file, instruction));

    try {
      const form = new FormData();
      form.set("file", file);
      form.set("mode", settings.imageMode === "Use uploaded image as style reference" ? "style-reference" : "explain");
      form.set("instruction", instruction);
      form.set("settings", JSON.stringify(settings));

      const payload = await readJson<PagePayload>(
        await fetch("/api/pages/from-upload", {
          method: "POST",
          body: form
        })
      );
      applyPayload(payload);
      setToast("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to generate from image");
      setToast("");
    } finally {
      setLoading(false);
    }
  }

  async function exportCurrentPath() {
    if (!session || !currentPage) return;
    const response = await fetch("/api/export/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: session.id,
        pageId: currentPage.id,
        scope: "path"
      })
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentPage.title || "visualwiki"}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyShareJson() {
    if (!session) return;
    await navigator.clipboard.writeText(
      JSON.stringify({ session, pages: history, edges }, null, 2)
    );
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (event.key === "Escape") setSettingsOpen(false);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        promptRef.current?.focus();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "e") {
        event.preventDefault();
        void exportCurrentPath();
      }
      if (event.key === "Backspace" && !isTyping) {
        event.preventDefault();
        goBack();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  useEffect(() => {
    fetch("/api/hydra/status")
      .then((response) => response.json())
      .then((data) => {
        setHydraStatus(data.enabled ? "connected" : "local");
      })
      .catch(() => setHydraStatus("local"));
  }, []);

  return (
    <main className="flex h-screen flex-col overflow-hidden paper-texture">
      <TopBar
        hydraStatus={hydraStatus}
        onSettings={() => setSettingsOpen(true)}
        onClear={() => {
          if (window.confirm("Start a new local VisualWiki session?")) {
            clearSession();
            setTopic("");
          }
        }}
      />
      <SettingsPanel
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={(next) => {
          setSettings(next);
          void fetch("/api/settings/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: session?.id || "local", settings: next })
          });
        }}
      />
      <ToastProvider message={toast} />

      <div className="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="order-2 flex min-h-0 flex-col gap-3 lg:order-none">
          <PromptComposer
            inputRef={promptRef}
            topic={topic}
            loading={loading}
            onTopicChange={setTopic}
            onGenerate={generateRoot}
            onInvalidUpload={(message) => {
              setToast(message);
              window.setTimeout(() => setToast(""), 2600);
            }}
            onImageGenerate={generateFromImage}
          />
          <div className="rounded-[1.2rem] border border-[#23352f]/18 bg-[#fffaf0]/88 p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="ui-font text-sm font-bold text-[#172b27]">Generation settings</p>
                <p className="ui-font mt-1 text-xs font-semibold text-[#5a6f68]">
                  {settings.style} / {settings.detailLevel}
                </p>
              </div>
              <SettingsButton onClick={() => setSettingsOpen(true)} />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <HistorySidebar
              pages={history}
              currentPageId={currentPage?.id}
              onSelect={setCurrentPage}
            />
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-0 flex-1 flex-col rounded-[1.3rem] border border-[#23352f]/18 bg-[#fffaf0]/70 p-3 shadow-sm"
          >
            <div className="mb-3 flex shrink-0 items-center justify-end">
              <PageActions
                canGoBack={Boolean(currentPage?.parentId)}
                loading={loading || !currentPage}
                depth={currentPage?.depth}
                onBack={goBack}
                onRegenerate={regenerate}
              />
            </div>

            <VisualBrowserFrame
              breadcrumbs={currentPage?.breadcrumbPath || []}
              disabled={!currentPage}
              hydraStatus={hydraStatus}
              depth={currentPage?.depth}
              generatedAt={currentPage?.createdAt}
              onExportPdf={() => void exportCurrentPath()}
              onCopyJson={() => void copyShareJson()}
            >
              <ImageStage
                imageUrl={currentPage?.imageUrl}
                pageId={currentPage?.id}
                title={currentPage?.title}
                loading={loading}
                onClickPoint={generateChild}
              />
            </VisualBrowserFrame>
          </motion.div>

          <ErrorState
            message={error}
            onRetry={() => {
              void (lastAction || generateRoot)();
            }}
          />

        </section>
      </div>
    </main>
  );
}
