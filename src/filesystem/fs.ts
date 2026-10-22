import { open, save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { readTextFile } from "@tauri-apps/plugin-fs";
import type { LineEnding } from "../state/types";
import { detectLineEnding, normalizeLineEndings } from "../utils/lineEndings";

const MARKDOWN_EXTENSIONS = ["md", "markdown", "mdown", "mkd"];

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
  /** Normalized to "\n" line endings. */
  content: string;
  lineEnding: LineEnding;
}

export interface OpenResult {
  files: OpenedFile[];
  /** Files that could not be read, with a user-facing reason. */
  failed: { name: string; message: string }[];
}

/** Reads several files; one unreadable file does not stop the rest from opening. */
export async function openFilesAtPaths(paths: string[]): Promise<OpenResult> {
  const result: OpenResult = { files: [], failed: [] };
  for (const path of paths) {
    try {
      result.files.push(await openFileAtPath(path));
    } catch (error) {
      const message = error instanceof FileOperationError ? error.message : toUserMessage(error);
      result.failed.push({ name: fileNameFromPath(path), message });
    }
  }
  return result;
}

/** Shows the native Open dialog (multi-select) and reads the chosen files. */
export async function pickAndOpenFiles(): Promise<OpenResult> {
  const selected = await open({
    multiple: true,
    filters: [{ name: "Markdown", extensions: MARKDOWN_EXTENSIONS }],
  });
  if (!selected) return { files: [], failed: [] };
  return openFilesAtPaths(Array.isArray(selected) ? selected : [selected]);
}

export async function openFileAtPath(path: string): Promise<OpenedFile> {
  try {
    const raw = await readTextFile(path);
    return {
      path,
      name: fileNameFromPath(path),
      content: normalizeLineEndings(raw),
      lineEnding: detectLineEnding(raw),
    };
  } catch (error) {
    throw new FileOperationError(toUserMessage(error), error);
  }
}

/** Writes content to an already-known path, atomically (temp file + rename) so a crash never truncates it. */
export async function writeFile(path: string, content: string): Promise<void> {
  try {
    await invoke("write_text_file_atomic", { path, contents: content });
  } catch (error) {
    throw new FileOperationError(toUserMessage(error), error);
  }
}

/** Opens the native "Save As" dialog, then writes the file. Returns the chosen path, or null if cancelled. */
export async function saveFileAs(content: string, suggestedName?: string): Promise<string | null> {
  const path = await save({
    defaultPath: suggestedName,
    filters: [{ name: "Markdown", extensions: MARKDOWN_EXTENSIONS }],
  });
  if (!path) return null;
  await writeFile(path, content);
  return path;
}
