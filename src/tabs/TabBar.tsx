import { X, Plus } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import type { EditorDocument } from "../state/types";
import { isDirty } from "../state/types";

interface TabBarProps {
  documents: EditorDocument[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onCloseOthers: (id: string) => void;
  onCloseAll: () => void;
  onNew: () => void;
}

interface ContextMenuState {
  docId: string;
  x: number;
  y: number;
}

export function TabBar({ documents, activeId, onSelect, onClose, onCloseOthers, onCloseAll, onNew }: TabBarProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  useEffect(() => {
    if (!contextMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") closeContextMenu();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [contextMenu, closeContextMenu]);

  if (documents.length === 0) return null;

  function handleContextMenu(e: React.MouseEvent, docId: string) {
    e.preventDefault();
    setContextMenu({ docId, x: e.clientX, y: e.clientY });
  }

  return (
    <div className="flex h-9 shrink-0 items-end border-b border-[var(--border)] bg-[var(--bg-app)]">
      <div role="tablist" aria-label="Open documents" className="flex h-full min-w-0 flex-1 items-end overflow-x-auto">
        {documents.map((doc) => {
          const active = doc.id === activeId;
          const dirty = isDirty(doc);
          return (
            <div
              key={doc.id}
              onClick={() => onSelect(doc.id)}
              role="tab"
              tabIndex={active ? 0 : -1}
              aria-selected={active}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(doc.id); }
              }}
              onContextMenu={(e) => handleContextMenu(e, doc.id)}
              className={[
                "group flex h-full max-w-[180px] min-w-[100px] shrink-0 cursor-pointer items-center gap-1.5 border-r border-[var(--border)] px-3 text-[12.5px] transition-colors",
                active
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)]"
                  : "bg-[var(--bg-app)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]",
              ].join(" ")}
            >
              {dirty && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />}
              <span className="truncate">{doc.title}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClose(doc.id); }}
                className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:bg-[var(--bg-active)] group-hover:opacity-100"
                aria-label={`Close ${doc.title}`}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onNew}
        title="New document (Ctrl+N)"
        className="flex h-full w-9 shrink-0 items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
      >
        <Plus size={14} />
      </button>

      {/* Context menu rendered via React */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[160px] rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] py-1 shadow-[var(--shadow-elevated)]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {[
            { label: "Close", action: () => onClose(contextMenu.docId) },
            { label: "Close Others", action: () => onCloseOthers(contextMenu.docId) },
            { label: "Close All", action: () => onCloseAll() },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => { item.action(); closeContextMenu(); }}
              className="flex w-full items-center px-3 py-1.5 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
