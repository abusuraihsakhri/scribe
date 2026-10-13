import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { isTauri } from "@tauri-apps/api/core";

const MARKDOWN_EXTENSIONS = ["md", "markdown", "mdown", "mkd"];
const MARKDOWN_PATTERN = /\.(md|markdown|mdown|mkd)$/i;
const MAX_BROWSER_FILE_BYTES = 20 * 1024 * 1024;
let browserFileId = 0;

/** In a browser, saving means downloading a copy, not overwriting the source file. */
export function downloadTextFile(content: string, name: string, mime = "text/markdown;charset=utf-8"): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function readBrowserFiles(files: File[]): Promise<OpenedFile[]> {
  const supported = files.filter((file) => MARKDOWN_PATTERN.test(file.name));
  return Promise.all(supported.map(async (file) => {
    if (file.size > MAX_BROWSER_FILE_BYTES) {
      throw new FileOperationError(`File "${file.name}" exceeds the 20 MB browser limit.`);
    }
    return { path: `browser/open-${++browserFileId}/${file.name}`, name: file.name, content: await file.text() };
  }));
}

export class FileOperationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "FileOperationError";
  }
}

function fileNameFromPath(path: string): string {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1] ?? path;
}

export function toUserMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();

  if (lower.includes("permission") || lower.includes("access is denied")) {
    return "You don't have permission to access this file. It may be read-only or in a protected location.";
  }
  if (lower.includes("no such file") || lower.includes("cannot find") || lower.includes("not found")) {
    return "This file could not be found. It may have been moved or deleted.";
  }
  if (lower.includes("locked") || lower.includes("being used by another process")) {
    return "This file is locked by another program. Close it there and try again.";
  }
  return "Something went wrong while accessing this file.";
}

export interface OpenedFile {
  path: string;
  name: string;
  content: string;
}

/** Opens multiple Markdown files at once (used for drag-and-drop). */
export async function pickAndOpenFiles(): Promise<OpenedFile[]> {
  if (!isTauri()) {
    return new Promise<OpenedFile[]>((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.accept = ".md,.markdown,.mdown,.mkd,text/markdown";
      input.addEventListener("change", () => {
        void readBrowserFiles(Array.from(input.files ?? [])).then(resolve, reject);
      }, { once: true });
      input.addEventListener("cancel", () => resolve([]), { once: true });
      input.click();
    });
  }
  const selected = await open({
    multiple: true,
    filters: [{ name: "Markdown", extensions: MARKDOWN_EXTENSIONS }],
  });
  if (!selected) return [];
  const paths = Array.isArray(selected) ? selected : [selected];
  const files: OpenedFile[] = [];
  for (const path of paths) {
    files.push(await openFileAtPath(path));
  }
  return files;
}

export async function openFileAtPath(path: string): Promise<OpenedFile> {
  if (!isTauri()) throw new FileOperationError("Reopen the file using Open Markdown File. Browsers cannot access a previous file path.");
  try {
    const content = await readTextFile(path);
    return { path, name: fileNameFromPath(path), content };
  } catch (error) {
    throw new FileOperationError(toUserMessage(error), error);
  }
}

/** Writes content to an already-known path. */
export async function writeFile(path: string, content: string): Promise<void> {
  if (!isTauri()) {
    downloadTextFile(content, fileNameFromPath(path));
    return;
  }
  try {
    await writeTextFile(path, content);
  } catch (error) {
    throw new FileOperationError(toUserMessage(error), error);
  }
}

/** Opens the native "Save As" dialog, then writes the file. Returns the chosen path, or null if cancelled. */
export async function saveFileAs(content: string, suggestedName?: string): Promise<string | null> {
  if (!isTauri()) {
    const name = fileNameFromPath(suggestedName || "Untitled.md");
    downloadTextFile(content, name);
    return `browser/saved/${name}`;
  }
  const path = await save({
    defaultPath: suggestedName,
    filters: [{ name: "Markdown", extensions: MARKDOWN_EXTENSIONS }],
  });
  if (!path) return null;
  await writeFile(path, content);
  return path;
}
