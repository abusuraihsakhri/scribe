export type ViewMode = "editor" | "preview" | "split";
export type ThemeMode = "light" | "dark" | "system";
export type LineEnding = "lf" | "crlf";

export interface EditorDocument {
  id: string;
  /** Absolute path on disk, or null for a new, never-saved document. */
  path: string | null;
  /** Display name, e.g. "notes.md" or "Untitled-1". */
  title: string;
  content: string;
  /** Content as last read from / written to disk, used to derive dirty state. */
  savedContent: string;
  /** Line ending of the file on disk. Content is always held with "\n" and converted back on save. */
  lineEnding: LineEnding;
}

export function isDirty(doc: EditorDocument): boolean {
  return doc.content !== doc.savedContent;
}
