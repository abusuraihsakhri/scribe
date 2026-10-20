import type { LineEnding } from "../state/types";

/** A file counts as CRLF if it contains any CRLF; mixed files are written back uniformly. */
export function detectLineEnding(text: string): LineEnding {
  return text.includes("\r\n") ? "crlf" : "lf";
}

/** CodeMirror stores text with "\n" only, so documents are kept in that form in memory. */
export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n?/g, "\n");
}

export function applyLineEnding(text: string, ending: LineEnding): string {
  return ending === "crlf" ? text.replace(/\n/g, "\r\n") : text;
}
