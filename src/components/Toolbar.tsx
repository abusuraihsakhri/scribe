import {
  FilePlus,
  FolderOpen,
  Save,
  SaveAll,
  Undo2,
  Redo2,
  Code2,
  Eye,
  Columns2,
  PanelLeft,
  Sun,
  Moon,
  MonitorCog,
  Settings,
} from "lucide-react";
import type { ViewMode, ThemeMode } from "../state/types";

interface ToolbarProps {
  fileName: string | null;
  isDirty: boolean;
  viewMode: ViewMode;
  theme: ThemeMode;
  sidebarVisible: boolean;
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onToggleSidebar: () => void;
  onCycleTheme: () => void;
  onOpenSettings?: () => void;
}

function ToolbarButton({
  title,
  onClick,
  children,
  active,
  disabled,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
        active
          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
        disabled ? "cursor-not-allowed opacity-40 hover:bg-transparent" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1.5 h-5 w-px bg-[var(--border)]" />;
}

const THEME_ICON: Record<ThemeMode, React.ReactNode> = {
  light: <Sun size={16} />,
  dark: <Moon size={16} />,
  system: <MonitorCog size={16} />,
};

export function Toolbar({
  fileName,
  isDirty,
  viewMode,
  theme,
  sidebarVisible,
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onUndo,
  onRedo,
  onViewModeChange,
  onToggleSidebar,
  onCycleTheme,
  onOpenSettings,
}: ToolbarProps) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-0.5 border-b border-[var(--border)] bg-[var(--bg-surface)] px-2">
      <ToolbarButton title="Toggle sidebar (Ctrl+\\)" onClick={onToggleSidebar} active={sidebarVisible}>
        <PanelLeft size={16} />
      </ToolbarButton>
      <Divider />
      <ToolbarButton title="New document (Ctrl+N)" onClick={onNew}>
        <FilePlus size={16} />
      </ToolbarButton>
      <ToolbarButton title="Open file (Ctrl+O)" onClick={onOpen}>
        <FolderOpen size={16} />
      </ToolbarButton>
      <ToolbarButton title="Save (Ctrl+S)" onClick={onSave}>
        <Save size={16} />
      </ToolbarButton>
      <ToolbarButton title="Save As (Ctrl+Shift+S)" onClick={onSaveAs}>
        <SaveAll size={16} />
      </ToolbarButton>
      <Divider />
      <ToolbarButton title="Undo (Ctrl+Z)" onClick={onUndo}>
        <Undo2 size={16} />
      </ToolbarButton>
      <ToolbarButton title="Redo (Ctrl+Y)" onClick={onRedo}>
        <Redo2 size={16} />
      </ToolbarButton>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-4 text-[13px] text-[var(--text-secondary)]">
        <span className="truncate">{fileName ?? "No document open"}</span>
        {isDirty && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" title="Unsaved changes" />}
      </div>

      <div className="flex items-center gap-0.5 rounded-md bg-[var(--bg-app)] p-0.5">
        <ToolbarButton title="Editor" onClick={() => onViewModeChange("editor")} active={viewMode === "editor"}>
          <Code2 size={16} />
        </ToolbarButton>
        <ToolbarButton title="Split view" onClick={() => onViewModeChange("split")} active={viewMode === "split"}>
          <Columns2 size={16} />
        </ToolbarButton>
        <ToolbarButton title="Preview" onClick={() => onViewModeChange("preview")} active={viewMode === "preview"}>
          <Eye size={16} />
        </ToolbarButton>
      </div>
      <Divider />
      <ToolbarButton title={`Theme: ${theme}`} onClick={onCycleTheme}>
        {THEME_ICON[theme]}
      </ToolbarButton>
      {onOpenSettings && (
        <ToolbarButton title="Settings" onClick={onOpenSettings}>
          <Settings size={16} />
        </ToolbarButton>
      )}
    </div>
  );
}
