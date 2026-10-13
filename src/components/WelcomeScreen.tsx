import { FilePlus, FolderOpen, FileText, Clock } from "lucide-react";
import { isTauri } from "@tauri-apps/api/core";
import { useRecentFilesStore } from "../state/recentFilesStore";

interface WelcomeScreenProps {
  onNew: () => void;
  onOpen: () => void;
  onOpenRecent?: (path: string) => void;
}

export function WelcomeScreen({ onNew, onOpen, onOpenRecent }: WelcomeScreenProps) {
  const recentFiles = useRecentFilesStore((s) => s.recentFiles);
  const recentToShow = recentFiles.slice(0, 8);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Scribe</h1>
        <p className="mt-1.5 text-[13.5px] text-[var(--text-secondary)]">
          Create a Markdown document or open an existing file.
        </p>
        {!isTauri() && (
          <p className="mx-auto mt-2 max-w-md px-4 text-[12px] text-[var(--text-tertiary)]">
            Browser saves download a copy. Unsaved edits are not backed up automatically.
          </p>
        )}
      </div>
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={onNew}
          className="flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)]"
        >
          <FilePlus size={15} />
          New Document
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-2 rounded-md border border-[var(--border-strong)] px-4 py-2 text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        >
          <FolderOpen size={15} />
          Open Markdown File
        </button>
      </div>
      <div className="mt-2 flex gap-4 text-[11.5px] text-[var(--text-tertiary)]">
        <span>Ctrl+N New Document</span>
        <span>Ctrl+O Open Document</span>
      </div>

      {/* Recent files */}
      {onOpenRecent && recentToShow.length > 0 && (
        <div className="mt-4 w-[360px]">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            <Clock size={11} />
            <span>Recent Files</span>
          </div>
          <div className="mt-2 flex flex-col">
            {recentToShow.map((file) => (
              <button
                key={file.path}
                type="button"
                onClick={() => onOpenRecent(file.path)}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-left text-[12.5px] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]"
                title={file.path}
              >
                <FileText size={14} className="shrink-0 text-[var(--text-tertiary)]" />
                <span className="min-w-0 truncate">{file.name}</span>
                <span className="ml-auto min-w-0 truncate text-[11px] text-[var(--text-tertiary)]">{file.path}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
