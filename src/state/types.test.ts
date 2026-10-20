import { describe, it, expect } from "vitest";
import { isDirty, type EditorDocument } from "./types";

function makeDoc(overrides: Partial<EditorDocument> = {}): EditorDocument {
  return {
    id: "doc-1",
    path: "/test/file.md",
    title: "file.md",
    content: "hello",
    savedContent: "hello",
    lineEnding: "lf",
    ...overrides,
  };
}

describe("isDirty", () => {
  it("returns false when content matches savedContent", () => {
    expect(isDirty(makeDoc())).toBe(false);
  });

  it("returns true when content differs from savedContent", () => {
    expect(isDirty(makeDoc({ content: "changed" }))).toBe(true);
  });

  it("returns false for empty document", () => {
    expect(isDirty(makeDoc({ content: "", savedContent: "" }))).toBe(false);
  });

  it("detects dirty state after whitespace change", () => {
    expect(isDirty(makeDoc({ content: "hello ", savedContent: "hello" }))).toBe(true);
  });
});
