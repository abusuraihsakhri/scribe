import { FileText, Clock, X, Trash2 } from "lucide-react";
import type { EditorDocument } from "../state/types";
import { isDirty } from "../state/types";
import { useRecentFilesStore } from "../state/recentFilesStore";

interface SidebarProps {
  documents: EditorDocument[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onOpenRecent?: (path: string) => void;
}

export function Sidebar({ documents, activeId, onSelect, onClose, onOpenRecent }: SidebarProps) {
  const recentFiles = useRecentFilesStore((s) => s.recentFiles);
  const removeRecent = useRecentFilesStore((s) => s.removeRecent);
  const clearRecent = useRecentFilesStore((s) => s.clearRecent);

  return (
    <div className="flex h-full w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-surface)]">
      {/* Open Documents */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          <span>Open Documents</span>
          <span className="text-[10px]">{documents.length}</span>
        </div>
        <div className="flex flex-col overflow-y-auto" style={{ maxHeight: "40%" }}>
          {documents.length === 0 ? (
            <div className="px-3 py-2 text-[12px] text-[var(--text-tertiary)]">No open documents</div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onSelect(doc.id)}
                className={[
                  "group flex cursor-pointer items-center gap-2 px-3 py-1.5 text-[12.5px] transition-colors",
                  doc.id === activeId ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
                ].join(" ")}
              >
                <FileText size={14} className="shrink-0 text-[var(--text-tertiary)]" />
                <span className="min-w-0 flex-1 truncate">{doc.title}</span>
                {isDirty(doc) && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onClose(doc.id); }}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:bg-[var(--bg-active)] group-hover:opacity-100"
                  aria-label={`Close ${doc.title}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Files are unavailable in browsers because local file handles cannot be reopened. */}
      {onOpenRecent && <div className="flex min-h-0 flex-1 flex-col border-t border-[var(--border)]">
        <div className="flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          <span className="flex items-center gap-1.5">
            <Clock size={11} />
            Recent
          </span>
          {recentFiles.length > 0 && (
            <button
              type="button"
              onClick={clearRecent}
              title="Clear recent files"
              className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {recentFiles.length === 0 ? (
            <div className="px-3 py-2 text-[12px] text-[var(--text-tertiary)]">No recent files</div>
          ) : (
            recentFiles.map((file) => (
              <div
                key={file.path}
                onClick={() => onOpenRecent?.(file.path)}
                className="group flex cursor-pointer items-center gap-2 px-3 py-1.5 text-[12.5px] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]"
                title={file.path}
              >
                <FileText size={14} className="shrink-0 text-[var(--text-tertiary)]" />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{file.name}</div>
                  <div className="truncate text-[11px] text-[var(--text-tertiary)]">{file.path}</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeRecent(file.path); }}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:bg-[var(--bg-active)] group-hover:opacity-100"
                  aria-label={`Remove ${file.name} from recent`}
                >
                  <X size={11} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>}
    </div>
  );
}
