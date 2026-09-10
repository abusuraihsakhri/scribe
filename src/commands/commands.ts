import {
  FilePlus,
  FolderOpen,
  Save,
  SaveAll,
  X,
  PanelLeft,
  Code2,
  Columns2,
  Eye,
  Search,
  Replace,
  Sun,
  Settings,
  Bold,
  Italic,
  Link,
  Maximize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon: LucideIcon;
  category: "file" | "edit" | "view" | "settings";
  action: () => void;
}

export function buildCommands(handlers: {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onClose: () => void;
  onToggleSidebar: () => void;
  onEditorMode: () => void;
  onSplitMode: () => void;
  onPreviewMode: () => void;
  onFind: () => void;
  onReplace: () => void;
  onCycleTheme: () => void;
  onOpenSettings: () => void;
  onBold: () => void;
  onItalic: () => void;
  onInsertLink: () => void;
  onFullscreen: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onExportHtml: () => void;
}): Command[] {
  return [
    { id: "new", label: "New Document", shortcut: "Ctrl+N", icon: FilePlus, category: "file", action: handlers.onNew },
    { id: "open", label: "Open File", shortcut: "Ctrl+O", icon: FolderOpen, category: "file", action: handlers.onOpen },
    { id: "save", label: "Save", shortcut: "Ctrl+S", icon: Save, category: "file", action: handlers.onSave },
    { id: "saveAs", label: "Save As", shortcut: "Ctrl+Shift+S", icon: SaveAll, category: "file", action: handlers.onSaveAs },
    { id: "close", label: "Close Document", shortcut: "Ctrl+W", icon: X, category: "file", action: handlers.onClose },
    { id: "exportHtml", label: "Export as HTML", icon: FileDown, category: "file", action: handlers.onExportHtml },
    { id: "find", label: "Find", shortcut: "Ctrl+F", icon: Search, category: "edit", action: handlers.onFind },
    { id: "replace", label: "Find and Replace", shortcut: "Ctrl+H", icon: Replace, category: "edit", action: handlers.onReplace },
    { id: "bold", label: "Bold", shortcut: "Ctrl+B", icon: Bold, category: "edit", action: handlers.onBold },
    { id: "italic", label: "Italic", shortcut: "Ctrl+I", icon: Italic, category: "edit", action: handlers.onItalic },
    { id: "insertLink", label: "Insert Link", shortcut: "Ctrl+K", icon: Link, category: "edit", action: handlers.onInsertLink },
    { id: "toggleSidebar", label: "Toggle Sidebar", shortcut: "Ctrl+\\", icon: PanelLeft, category: "view", action: handlers.onToggleSidebar },
    { id: "editorMode", label: "Editor Mode", shortcut: "Ctrl+1", icon: Code2, category: "view", action: handlers.onEditorMode },
    { id: "splitMode", label: "Split View", shortcut: "Ctrl+2", icon: Columns2, category: "view", action: handlers.onSplitMode },
    { id: "previewMode", label: "Preview Mode", shortcut: "Ctrl+3", icon: Eye, category: "view", action: handlers.onPreviewMode },
    { id: "fullscreen", label: "Toggle Fullscreen", shortcut: "F11", icon: Maximize, category: "view", action: handlers.onFullscreen },
    { id: "zoomIn", label: "Zoom In", shortcut: "Ctrl+=", icon: ZoomIn, category: "view", action: handlers.onZoomIn },
    { id: "zoomOut", label: "Zoom Out", shortcut: "Ctrl+-", icon: ZoomOut, category: "view", action: handlers.onZoomOut },
    { id: "zoomReset", label: "Reset Zoom", shortcut: "Ctrl+0", icon: RotateCcw, category: "view", action: handlers.onZoomReset },
    { id: "cycleTheme", label: "Toggle Theme", icon: Sun, category: "settings", action: handlers.onCycleTheme },
    { id: "settings", label: "Settings", icon: Settings, category: "settings", action: handlers.onOpenSettings },
  ];
}

export function fuzzyMatch(query: string, label: string): boolean {
  const q = query.toLowerCase();
  const l = label.toLowerCase();
  if (l.includes(q)) return true;
  // Simple fuzzy: all chars in query appear in order in label
  let qi = 0;
  for (let li = 0; li < l.length && qi < q.length; li++) {
    if (l[li] === q[qi]) qi++;
  }
  return qi === q.length;
}
