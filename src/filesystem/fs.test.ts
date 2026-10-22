import { describe, it, expect, vi } from "vitest";

vi.mock("@tauri-apps/plugin-fs", () => ({ readTextFile: vi.fn() }));
vi.mock("@tauri-apps/plugin-dialog", () => ({ open: vi.fn(), save: vi.fn() }));
vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn() }));

const { readTextFile } = await import("@tauri-apps/plugin-fs");
const { openFilesAtPaths } = await import("./fs");

describe("openFilesAtPaths", () => {
  it("opens the readable files and reports the rest", async () => {
    vi.mocked(readTextFile).mockImplementation(async (path) => {
      if (String(path).endsWith("locked.md")) throw new Error("The process cannot access the file because it is being used by another process");
      return "# ok\r\n";
    });

    const { files, failed } = await openFilesAtPaths(["C:\\a.md", "C:\\locked.md", "C:\\b.md"]);

    expect(files.map((f) => f.name)).toEqual(["a.md", "b.md"]);
    expect(files[0]).toMatchObject({ content: "# ok\n", lineEnding: "crlf" });
    expect(failed).toEqual([{ name: "locked.md", message: expect.stringContaining("locked by another program") }]);
  });
});
