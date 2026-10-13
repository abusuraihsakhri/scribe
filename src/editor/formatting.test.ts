import { describe, it, expect } from "vitest";
import { insertAtSelection, toggleLinePrefix, wrapSelection } from "./formatting";

describe("Markdown formatting transformations", () => {
  it("wraps and unwraps a selection in bold markup", () => {
    const wrapped = wrapSelection("hello world", 0, 5, "**");
    expect(wrapped.text).toBe("**hello** world");
    const unwrapped = wrapSelection(wrapped.text, 2, 7, "**");
    expect(unwrapped.text).toBe("hello world");
  });

  it("provides a selectable placeholder for an empty selection", () => {
    const result = wrapSelection("a", 1, 1, "*");
    expect(result.text).toBe("a*text*");
    expect(result.text.slice(result.from, result.to)).toBe("text");
  });

  it("replaces the selected text with a link instead of duplicating it", () => {
    const result = insertAtSelection("hello world", 0, 5, "[", "](url)", "hello");
    expect(result.text).toBe("[hello](url) world");
    expect(result.text.slice(result.from, result.to)).toBe("hello");
  });

  it("replaces selection with an image construct", () => {
    const result = insertAtSelection("before alt after", 7, 10, "![", "](image-url)", "alt");
    expect(result.text).toBe("before ![alt](image-url) after");
  });

  it("inserts a placeholder when the selection is empty", () => {
    const result = insertAtSelection("", 0, 0, "[", "](url)", "link text");
    expect(result.text).toBe("[link text](url)");
    expect(result.text.slice(result.from, result.to)).toBe("link text");
  });

  it("toggles prefixes on a line selection", () => {
    const result = toggleLinePrefix("one\ntwo", 0, 6, "- ");
    expect(result.text).toBe("- one\n- two");
    expect(toggleLinePrefix(result.text, 2, 10, "- ").text).toBe("one\ntwo");
  });
});
