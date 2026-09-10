import { describe, it, expect } from "vitest";
import { computeTextStats } from "./textStats";

describe("computeTextStats", () => {
  it("counts words and characters", () => {
    const stats = computeTextStats("hello world");
    expect(stats.words).toBe(2);
    expect(stats.characters).toBe(11);
  });

  it("returns 0 words for empty string", () => {
    const stats = computeTextStats("");
    expect(stats.words).toBe(0);
    expect(stats.characters).toBe(0);
  });

  it("handles whitespace-only string", () => {
    const stats = computeTextStats("   ");
    expect(stats.words).toBe(0);
    expect(stats.characters).toBe(3);
  });

  it("handles multiple spaces between words", () => {
    const stats = computeTextStats("hello   world");
    expect(stats.words).toBe(2);
  });

  it("handles newlines", () => {
    const stats = computeTextStats("line one\nline two\nline three");
    expect(stats.words).toBe(6);
    expect(stats.characters).toBe(28);
  });
});
