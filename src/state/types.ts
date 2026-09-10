export type ViewMode = "editor" | "preview" | "split";
export type ThemeMode = "light" | "dark" | "system";

export interface EditorDocument {
  id: string;
  /** Absolute path on disk, or null for a new, never-saved document. */
  path: string | null;
  /** Display name, e.g. "notes.md" or "Untitled-1". */
  title: string;
  content: string;
  /** Content as last read from / written to disk, used to derive dirty state. */
  savedContent: string;
}

export function isDirty(doc: EditorDocument): boolean {
  return doc.content !== doc.savedContent;
}
