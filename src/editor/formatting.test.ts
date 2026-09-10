import { describe, it, expect } from "vitest";

// Test the pure formatting logic patterns

describe("formatting logic", () => {
  it("bold wrapper adds ** around text", () => {
    const text = "hello world";
    const wrapper = "**";
    const from = 0;
    const to = 11;
    const result = text.slice(0, from) + wrapper + text.slice(from, to) + wrapper + text.slice(to);
    expect(result).toBe("**hello world**");
  });

  it("italic wrapper adds * around text", () => {
    const text = "hello world";
    const wrapper = "*";
    const result = text.slice(0, 0) + wrapper + text.slice(0, 11) + wrapper + text.slice(11);
    expect(result).toBe("*hello world*");
  });

  it("heading prefix adds ## to line", () => {
    const text = "My Title";
    const result = "## " + text;
    expect(result).toBe("## My Title");
  });

  it("bullet list prefix adds - to lines", () => {
    const lines = ["item 1", "item 2"];
    const result = lines.map((l) => "- " + l).join("\n");
    expect(result).toBe("- item 1\n- item 2");
  });

  it("link insertion creates markdown link", () => {
    const text = "hello world";
    const from = 0;
    const to = 11;
    const result = text.slice(0, from) + "[" + text.slice(from, to) + "](url)" + text.slice(to);
    expect(result).toBe("[hello world](url)");
  });
});
