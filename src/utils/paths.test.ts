import { describe, it, expect } from "vitest";
import { dirname, isAbsolutePath, resolveRelativePath } from "./paths";

describe("resolveRelativePath", () => {
  it("joins with the base directory's separator", () => {
    expect(resolveRelativePath("C:\\docs", "img/a.png")).toBe("C:\\docs\\img\\a.png");
    expect(resolveRelativePath("/home/u/docs", "./img/a.png")).toBe("/home/u/docs/img/a.png");
  });

  it("resolves parent segments", () => {
    expect(resolveRelativePath("C:\\docs\\guide", "../assets/a.png")).toBe("C:\\docs\\assets\\a.png");
    expect(resolveRelativePath("/home/u/docs", "../../x.png")).toBe("/home/x.png");
  });

  it("refuses to climb above the root", () => {
    expect(resolveRelativePath("C:\\docs", "../../a.png")).toBeNull();
    expect(resolveRelativePath("/docs", "../../a.png")).toBeNull();
  });
});

describe("isAbsolutePath", () => {
  it("recognises drive and POSIX paths but not UNC shares", () => {
    expect(isAbsolutePath("C:\\a.png")).toBe(true);
    expect(isAbsolutePath("/a.png")).toBe(true);
    expect(isAbsolutePath("\\\\server\\a.png")).toBe(false);
    expect(isAbsolutePath("//server/a.png")).toBe(false);
    expect(isAbsolutePath("a.png")).toBe(false);
  });
});

describe("dirname", () => {
  it("drops the file name", () => {
    expect(dirname("C:\\docs\\a.md")).toBe("C:\\docs");
    expect(dirname("/home/u/a.md")).toBe("/home/u");
  });
});
