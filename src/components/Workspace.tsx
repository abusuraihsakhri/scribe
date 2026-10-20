import { useRef, useState } from "react";
import type { EditorView } from "@codemirror/view";
import { CodeEditor } from "../editor/CodeEditor";
import { Preview } from "../preview/Preview";
import { useDebouncedValue } from "../utils/useDebouncedValue";
import type { ViewMode } from "../state/types";

interface WorkspaceProps {
  viewMode: ViewMode;
  docId: string;
  content: string;
  onChange: (value: string) => void;
  editorRef: React.MutableRefObject<EditorView | null>;
  onCursorInfo: (info: { line: number; column: number }) => void;
  editorFontSize?: number;
  editorFontFamily?: string;
  editorWordWrap?: boolean;
  editorLineNumbers?: boolean;
  editorHighlightLine?: boolean;
  editorTabSize?: number;
  docPath?: string | null;
}

const PREVIEW_DEBOUNCE_MS = 150;

export function Workspace({ viewMode, docId, content, onChange, editorRef, onCursorInfo, editorFontSize, editorFontFamily, editorWordWrap, editorLineNumbers, editorHighlightLine, editorTabSize, docPath }: WorkspaceProps) {
  const debouncedContent = useDebouncedValue(content, PREVIEW_DEBOUNCE_MS);
  const [splitRatio, setSplitRatio] = useState(0.5);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  function handleDividerPointerDown(e: React.PointerEvent) {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handleDividerPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setSplitRatio(Math.min(0.8, Math.max(0.2, ratio)));
  }

  function handleDividerPointerUp() {
    draggingRef.current = false;
  }

  // Resolve base path for relative images
  const basePath = docPath ? docPath.replace(/[\\/][^\\/]+$/, "") : undefined;

  const editorPane = (
    <div className="h-full min-w-0" style={{ background: "var(--editor-bg)" }}>
      <CodeEditor
        docId={docId}
        value={content}
        onChange={onChange}
        editorRef={editorRef}
        onCursorInfo={onCursorInfo}
        fontSize={editorFontSize}
        fontFamily={editorFontFamily}
        wordWrap={editorWordWrap}
        showLineNumbers={editorLineNumbers}
        highlightCurrentLine={editorHighlightLine}
        tabSize={editorTabSize}
      />
    </div>
  );

  const previewPane = (
    <div className="h-full min-w-0 overflow-y-auto" style={{ background: "var(--bg-surface)" }}>
      <Preview content={debouncedContent} basePath={basePath} />
    </div>
  );

  if (viewMode === "editor") return <div className="h-full min-h-0">{editorPane}</div>;
  if (viewMode === "preview") return <div className="h-full min-h-0">{previewPane}</div>;

  return (
    <div ref={containerRef} className="flex h-full min-h-0">
      <div style={{ width: `${splitRatio * 100}%` }} className="h-full min-w-0">
        {editorPane}
      </div>
      <div
        onPointerDown={handleDividerPointerDown}
        onPointerMove={handleDividerPointerMove}
        onPointerUp={handleDividerPointerUp}
        className="w-1 shrink-0 cursor-col-resize bg-[var(--border)] transition-colors hover:bg-[var(--accent)]"
      />
      <div style={{ width: `${(1 - splitRatio) * 100}%` }} className="h-full min-w-0">
        {previewPane}
      </div>
    </div>
  );
}
