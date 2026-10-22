import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EditorView } from "@codemirror/view";
import { undo, redo } from "@codemirror/commands";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { message } from "@tauri-apps/plugin-dialog";
import { Toolbar } from "./components/Toolbar";
import { FormattingToolbar } from "./components/FormattingToolbar";
import { StatusBar } from "./components/StatusBar";
import { Workspace } from "./components/Workspace";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { Sidebar } from "./components/Sidebar";
import { TabBar } from "./tabs/TabBar";
import { SearchPanel } from "./search/SearchPanel";
import { CommandPalette } from "./commands/CommandPalette";
import { buildCommands } from "./commands/commands";
import { SettingsDialog } from "./settings/SettingsDialog";
import { UnsavedChangesDialog, type UnsavedChangesChoice } from "./components/UnsavedChangesDialog";
import { useDocumentsStore, isDirty } from "./state/documentsStore";
import { useUIStore } from "./state/uiStore";
import { useSettingsStore } from "./settings/settingsStore";
import { useRecentFilesStore } from "./state/recentFilesStore";
import { pickAndOpenFiles, openFileAtPath, openFilesAtPaths, FileOperationError, type OpenResult } from "./filesystem/fs";
import { useOpenFileRequests } from "./filesystem/useOpenFileRequests";
import { useExternalFileChanges } from "./filesystem/useExternalFileChanges";
import { computeTextStats } from "./utils/textStats";
import { applyFormat } from "./editor/formatting";
import { retainEditorStates } from "./editor/CodeEditor";
import type { ThemeMode } from "./state/types";

const THEME_CYCLE: ThemeMode[] = ["light", "dark", "system"];

export default function App() {
  const documents = useDocumentsStore((s) => s.documents);
  const activeId = useDocumentsStore((s) => s.activeId);
  const newDocument = useDocumentsStore((s) => s.newDocument);
  const openFromDisk = useDocumentsStore((s) => s.openFromDisk);
  const updateContent = useDocumentsStore((s) => s.updateContent);
  const closeDocumentInStore = useDocumentsStore((s) => s.closeDocument);
  const save = useDocumentsStore((s) => s.save);
  const saveAs = useDocumentsStore((s) => s.saveAs);

  const viewMode = useUIStore((s) => s.viewMode);
  const setViewMode = useUIStore((s) => s.setViewMode);
  const sidebarVisible = useUIStore((s) => s.sidebarVisible);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

  const settings = useSettingsStore();
  const addRecent = useRecentFilesStore((s) => s.addRecent);

  const activeDoc = useMemo(() => documents.find((d) => d.id === activeId) ?? null, [documents, activeId]);
  const editorRef = useRef<EditorView | null>(null);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [pendingClose, setPendingClose] = useState<{
    fileName: string;
    resolve: (choice: UnsavedChangesChoice) => void;
  } | null>(null);
  const [searchMode, setSearchMode] = useState<"search" | "replace" | null>(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Sync settings with uiStore
  useEffect(() => {
    if (settings.theme !== theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme, theme, setTheme]);

  // Forget editor undo history for closed documents
  useEffect(() => {
    retainEditorStates(new Set(documents.map((d) => d.id)));
  }, [documents]);

  // Apply zoom
  useEffect(() => {
    document.documentElement.style.fontSize = `${zoom}%`;
  }, [zoom]);

  useExternalFileChanges();

  // Autosave
  useEffect(() => {
    if (!settings.autosave) return;
    const interval = setInterval(() => {
      void useDocumentsStore.getState().autosaveAll();
    }, settings.autosaveIntervalMs);
    return () => clearInterval(interval);
  }, [settings.autosave, settings.autosaveIntervalMs]);

  const showError = useCallback(async (title: string, err: unknown) => {
    const detail = err instanceof FileOperationError ? err.message : "An unexpected error occurred.";
    await message(detail, { title, kind: "error" });
  }, []);

  const handleNew = useCallback(() => {
    newDocument();
  }, [newDocument]);

  // Adds opened files as tabs and reports any that couldn't be read in a single dialog.
  const addOpenedFiles = useCallback(async ({ files, failed }: OpenResult) => {
    for (const f of files) {
      openFromDisk(f);
      addRecent(f.path, f.name);
    }
    if (failed.length > 0) {
      await message(failed.map((f) => `${f.name}: ${f.message}`).join("\n"), {
        title: failed.length === 1 ? "Couldn't open file" : "Couldn't open some files",
        kind: "error",
      });
    }
  }, [openFromDisk, addRecent]);

  const handleOpen = useCallback(async () => {
    try {
      await addOpenedFiles(await pickAndOpenFiles());
    } catch (err) {
      await showError("Couldn't open file", err);
    }
  }, [addOpenedFiles, showError]);

  const handleOpenRecent = useCallback(async (path: string) => {
    try {
      const file = await openFileAtPath(path);
      openFromDisk(file);
      addRecent(file.path, file.name);
    } catch (err) {
      await showError("Couldn't open file", err);
    }
  }, [openFromDisk, showError, addRecent]);

  const handleSave = useCallback(async () => {
    if (!activeId) return;
    try {
      const result = await save(activeId);
      if (result) {
        const doc = useDocumentsStore.getState().documents.find((d) => d.id === activeId);
        if (doc?.path) addRecent(doc.path, doc.title);
      }
    } catch (err) {
      await showError("Couldn't save file", err);
    }
  }, [activeId, save, showError, addRecent]);

  const handleSaveAs = useCallback(async () => {
    if (!activeId) return;
    try {
      const result = await saveAs(activeId);
      if (result) {
        const doc = useDocumentsStore.getState().documents.find((d) => d.id === activeId);
        if (doc?.path) addRecent(doc.path, doc.title);
      }
    } catch (err) {
      await showError("Couldn't save file", err);
    }
  }, [activeId, saveAs, showError, addRecent]);

  const confirmDiscardIfDirty = useCallback(
    async (docId: string): Promise<boolean> => {
      const doc = documents.find((d) => d.id === docId);
      if (!doc || !isDirty(doc)) return true;

      const choice = await new Promise<UnsavedChangesChoice>((resolve) => {
        setPendingClose({ fileName: doc.title, resolve });
      });
      setPendingClose(null);

      if (choice === "cancel") return false;
      if (choice === "save") {
        const saved = await save(docId);
        return saved;
      }
      return true;
    },
    [documents, save],
  );

  const handleCloseDocument = useCallback(
    async (docId: string) => {
      const canClose = await confirmDiscardIfDirty(docId);
      if (canClose) closeDocumentInStore(docId);
    },
    [confirmDiscardIfDirty, closeDocumentInStore],
  );

  const handleCloseOthers = useCallback(
    async (keepId: string) => {
      for (const doc of documents) {
        if (doc.id === keepId) continue;
        const canClose = await confirmDiscardIfDirty(doc.id);
        if (canClose) closeDocumentInStore(doc.id);
        else break;
      }
    },
    [documents, confirmDiscardIfDirty, closeDocumentInStore],
  );

  const handleCloseAll = useCallback(async () => {
    for (const doc of documents) {
      const canClose = await confirmDiscardIfDirty(doc.id);
      if (canClose) closeDocumentInStore(doc.id);
      else break;
    }
  }, [documents, confirmDiscardIfDirty, closeDocumentInStore]);

  const handleUndo = useCallback(() => {
    if (editorRef.current) undo(editorRef.current);
  }, []);
  const handleRedo = useCallback(() => {
    if (editorRef.current) redo(editorRef.current);
  }, []);

  const handleCycleTheme = useCallback(() => {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length];
    setTheme(next);
    useSettingsStore.getState().update({ theme: next });
  }, [theme, setTheme]);

  const handleContentChange = useCallback(
    (value: string) => {
      if (activeId) updateContent(activeId, value);
    },
    [activeId, updateContent],
  );

  const handleFullscreen = useCallback(async () => {
    const win = getCurrentWindow();
    const isFull = await win.isFullscreen();
    await win.setFullscreen(!isFull);
  }, []);

  const handleExportHtml = useCallback(async () => {
    if (!activeDoc) return;
    const { save: saveDialog } = await import("@tauri-apps/plugin-dialog");
    const { writeTextFile } = await import("@tauri-apps/plugin-fs");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const React = await import("react");
    const { default: ReactMarkdown } = await import("react-markdown");
    const { default: remarkGfm } = await import("remark-gfm");
    const { default: rehypeHighlight } = await import("rehype-highlight");
    const { default: rehypeSanitize } = await import("rehype-sanitize");
    const { previewSanitizeSchema } = await import("./markdown/sanitizeSchema");

    const path = await saveDialog({
      defaultPath: activeDoc.title.replace(/\.md$/, ".html"),
      filters: [{ name: "HTML", extensions: ["html"] }],
    });
    if (!path) return;

    const renderedBody = renderToStaticMarkup(
      React.createElement(
        ReactMarkdown,
        {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeHighlight, [rehypeSanitize, previewSanitizeSchema]] as never[],
        },
        activeDoc.content,
      ),
    );

    const safeTitle = activeDoc.title
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${safeTitle}</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 48rem; margin: 0 auto; padding: 2rem; line-height: 1.7; color: #1f2328; background: #ffffff; }
h1,h2,h3,h4,h5,h6 { font-weight: 600; line-height: 1.25; margin-top: 1.5em; margin-bottom: 0.5em; }
h1 { font-size: 2rem; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
h2 { font-size: 1.5rem; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
h3 { font-size: 1.25rem; }
a { color: #0969da; text-decoration: none; }
a:hover { text-decoration: underline; }
code { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace; background: rgba(175,184,193,0.2); padding: 0.2em 0.4em; border-radius: 6px; font-size: 85%; }
pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; line-height: 1.45; }
pre code { background: transparent; padding: 0; font-size: 100%; }
blockquote { border-left: 0.25em solid #d0d7de; padding: 0 1em; color: #656d76; margin: 1em 0; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; }
th, td { border: 1px solid #d0d7de; padding: 6px 13px; text-align: left; }
tr:nth-child(2n) { background: #f6f8fa; }
th { background: #f6f8fa; font-weight: 600; }
img { max-width: 100%; height: auto; }
hr { height: 0.25em; padding: 0; margin: 24px 0; background-color: #d0d7de; border: 0; }
ul, ol { padding-left: 2em; margin: 0.5em 0; }
li + li { margin-top: 0.25em; }
</style>
</head>
<body class="markdown-body">${renderedBody}</body>
</html>`;
    await writeTextFile(path, html);
  }, [activeDoc]);

  const handleBold = useCallback(() => { if (editorRef.current) applyFormat(editorRef.current, "bold"); }, []);
  const handleItalic = useCallback(() => { if (editorRef.current) applyFormat(editorRef.current, "italic"); }, []);
  const handleInsertLink = useCallback(() => { if (editorRef.current) applyFormat(editorRef.current, "link"); }, []);

  // Build command palette commands
  const commands = useMemo(() => buildCommands({
    onNew: handleNew,
    onOpen: () => void handleOpen(),
    onSave: () => void handleSave(),
    onSaveAs: () => void handleSaveAs(),
    onClose: () => { if (activeId) void handleCloseDocument(activeId); },
    onToggleSidebar: toggleSidebar,
    onEditorMode: () => setViewMode("editor"),
    onSplitMode: () => setViewMode("split"),
    onPreviewMode: () => setViewMode("preview"),
    onFind: () => setSearchMode("search"),
    onReplace: () => setSearchMode("replace"),
    onCycleTheme: handleCycleTheme,
    onOpenSettings: () => setShowSettings(true),
    onBold: handleBold,
    onItalic: handleItalic,
    onInsertLink: handleInsertLink,
    onFullscreen: () => void handleFullscreen(),
    onZoomIn: () => setZoom((z) => Math.min(z + 10, 200)),
    onZoomOut: () => setZoom((z) => Math.max(z - 10, 50)),
    onZoomReset: () => setZoom(100),
    onExportHtml: () => void handleExportHtml(),
  }), [handleNew, handleOpen, handleSave, handleSaveAs, activeId, handleCloseDocument, toggleSidebar, setViewMode, handleCycleTheme, handleBold, handleItalic, handleInsertLink, handleFullscreen, handleExportHtml]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't intercept if command palette or search is open
      if (showCommandPalette) return;

      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // F11 fullscreen
      if (e.key === "F11") {
        e.preventDefault();
        void handleFullscreen();
        return;
      }

      if (!mod) return;

      // Ctrl+Shift+P - Command palette
      if (key === "p" && e.shiftKey) {
        e.preventDefault();
        setShowCommandPalette(true);
        return;
      }

      // Ctrl+F - Find
      if (key === "f") {
        e.preventDefault();
        setSearchMode((prev) => prev === "search" ? null : "search");
        return;
      }

      // Ctrl+H - Replace
      if (key === "h") {
        e.preventDefault();
        setSearchMode((prev) => prev === "replace" ? null : "replace");
        return;
      }

      // Ctrl+N - New
      if (key === "n") {
        e.preventDefault();
        handleNew();
        return;
      }

      // Ctrl+O - Open
      if (key === "o") {
        e.preventDefault();
        void handleOpen();
        return;
      }

      // Ctrl+Shift+S - Save As
      if (key === "s" && e.shiftKey) {
        e.preventDefault();
        void handleSaveAs();
        return;
      }

      // Ctrl+S - Save
      if (key === "s") {
        e.preventDefault();
        void handleSave();
        return;
      }

      // Ctrl+W - Close
      if (key === "w") {
        e.preventDefault();
        if (activeId) void handleCloseDocument(activeId);
        return;
      }

      // Ctrl+\ - Toggle sidebar
      if (key === "\\") {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Ctrl+1/2/3 - View modes
      if (key === "1") { e.preventDefault(); setViewMode("editor"); return; }
      if (key === "2") { e.preventDefault(); setViewMode("split"); return; }
      if (key === "3") { e.preventDefault(); setViewMode("preview"); return; }

      // Ctrl+B - Bold (handled by CodeMirror keymap when editor focused)
      // Ctrl+I - Italic (handled by CodeMirror keymap when editor focused)
      // Ctrl+K - Link (handled by CodeMirror keymap when editor focused)

      // Ctrl+= / Ctrl+- / Ctrl+0 - Zoom
      if (key === "=" || e.key === "+") { e.preventDefault(); setZoom((z) => Math.min(z + 10, 200)); return; }
      if (key === "-") { e.preventDefault(); setZoom((z) => Math.max(z - 10, 50)); return; }
      if (key === "0") { e.preventDefault(); setZoom(100); return; }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleNew, handleOpen, handleSave, handleSaveAs, handleCloseDocument, activeId, toggleSidebar, setViewMode, handleFullscreen, showCommandPalette]);

  useOpenFileRequests((paths) => {
    void openFilesAtPaths(paths).then(addOpenedFiles);
  });

  // Links to other Markdown files in the preview
  const handleOpenLinkedFile = useCallback((path: string) => {
    void openFilesAtPaths([path]).then(addOpenedFiles);
  }, [addOpenedFiles]);

  // Window close guard
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    void getCurrentWindow()
      .onCloseRequested(async (event) => {
        try {
          if (!useSettingsStore.getState().confirmBeforeClose) return;
          const dirtyDocs = useDocumentsStore.getState().documents.filter(isDirty);
          if (dirtyDocs.length === 0) return;
          event.preventDefault();
          for (const doc of dirtyDocs) {
            const canClose = await confirmDiscardIfDirty(doc.id);
            if (!canClose) return;
          }
          try {
            await invoke("exit_app");
          } catch {
            await getCurrentWindow().destroy();
          }
        } catch (err) {
          console.error("Window close error:", err);
          try {
            await invoke("exit_app");
          } catch {
            await getCurrentWindow().destroy();
          }
        }
      })
      .then((fn) => { unlisten = fn; });
    return () => unlisten?.();
  }, [confirmDiscardIfDirty]);

  // Window title
  useEffect(() => {
    const title = activeDoc ? `${isDirty(activeDoc) ? "● " : ""}${activeDoc.title} | Scribe` : "Scribe";
    void getCurrentWindow().setTitle(title);
  }, [activeDoc]);

  const stats = useMemo(() => computeTextStats(activeDoc?.content ?? ""), [activeDoc?.content]);

  return (
    <div className="flex h-screen flex-col bg-[var(--bg-app)]">
      <Toolbar
        fileName={activeDoc?.title ?? null}
        isDirty={activeDoc ? isDirty(activeDoc) : false}
        viewMode={viewMode}
        theme={theme}
        sidebarVisible={sidebarVisible}
        onNew={handleNew}
        onOpen={() => void handleOpen()}
        onSave={() => void handleSave()}
        onSaveAs={() => void handleSaveAs()}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onViewModeChange={setViewMode}
        onToggleSidebar={toggleSidebar}
        onCycleTheme={handleCycleTheme}
        onOpenSettings={() => setShowSettings(true)}
      />

      {activeDoc && <FormattingToolbar editorRef={editorRef} />}

      {activeDoc && searchMode && (
        <SearchPanel editorRef={editorRef} mode={searchMode} onClose={() => setSearchMode(null)} />
      )}

      <TabBar
        documents={documents}
        activeId={activeId}
        onSelect={(id) => useDocumentsStore.getState().setActive(id)}
        onClose={(id) => void handleCloseDocument(id)}
        onCloseOthers={handleCloseOthers}
        onCloseAll={handleCloseAll}
        onNew={handleNew}
      />

      <div className="flex min-h-0 flex-1">
        {sidebarVisible && (
          <Sidebar
            documents={documents}
            activeId={activeId}
            onSelect={(id) => useDocumentsStore.getState().setActive(id)}
            onClose={(id) => void handleCloseDocument(id)}
            onOpenRecent={(path) => void handleOpenRecent(path)}
          />
        )}
        <div className="min-h-0 flex-1">
          {activeDoc ? (
            <Workspace
              viewMode={viewMode}
              docId={activeDoc.id}
              content={activeDoc.content}
              onChange={handleContentChange}
              editorRef={editorRef}
              onCursorInfo={setCursor}
              editorFontSize={settings.editorFontSize}
              editorFontFamily={settings.editorFontFamily}
              editorWordWrap={settings.editorWordWrap}
              editorLineNumbers={settings.editorLineNumbers}
              editorHighlightLine={settings.editorHighlightLine}
              editorTabSize={settings.editorTabSize}
              docPath={activeDoc.path}
              onOpenFile={handleOpenLinkedFile}
            />
          ) : (
            <WelcomeScreen
              onNew={handleNew}
              onOpen={() => void handleOpen()}
              onOpenRecent={(path) => void handleOpenRecent(path)}
            />
          )}
        </div>
      </div>

      <StatusBar
        words={stats.words}
        characters={stats.characters}
        line={cursor.line}
        column={cursor.column}
        lineEnding={activeDoc?.lineEnding}
      />

      {pendingClose && (
        <UnsavedChangesDialog fileName={pendingClose.fileName} onChoice={(choice) => pendingClose.resolve(choice)} />
      )}

      {showCommandPalette && (
        <CommandPalette commands={commands} onClose={() => setShowCommandPalette(false)} />
      )}

      {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} />}
    </div>
  );
}
