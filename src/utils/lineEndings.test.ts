import { describe, it, expect } from "vitest";
import { EditorState } from "@codemirror/state";
import { detectLineEnding, normalizeLineEndings, applyLineEnding } from "./lineEndings";

describe("detectLineEnding", () => {
  it("detects CRLF", () => {
    expect(detectLineEnding("a\r\nb")).toBe("crlf");
  });

  it("defaults to LF", () => {
    expect(detectLineEnding("a\nb")).toBe("lf");
    expect(detectLineEnding("")).toBe("lf");
  });
});

describe("normalizeLineEndings", () => {
  it("converts CRLF and lone CR to LF", () => {
    expect(normalizeLineEndings("a\r\nb\rc\nd")).toBe("a\nb\nc\nd");
  });

  it("matches what CodeMirror hands back, so an untouched file is not dirty", () => {
    const raw = "# Title\r\n\r\n- item\r\n";
    const fromEditor = EditorState.create({ doc: normalizeLineEndings(raw) }).doc.toString();
    expect(fromEditor).toBe(normalizeLineEndings(raw));
  });
});

describe("applyLineEnding", () => {
  it("round-trips a CRLF file byte for byte", () => {
    const raw = "# Title\r\n\r\nbody\r\n";
    const ending = detectLineEnding(raw);
    expect(applyLineEnding(normalizeLineEndings(raw), ending)).toBe(raw);
  });

  it("leaves LF text unchanged", () => {
    expect(applyLineEnding("a\nb\n", "lf")).toBe("a\nb\n");
  });
});
