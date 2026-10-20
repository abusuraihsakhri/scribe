import { describe, it, expect, vi, beforeEach } from "vitest";
import type { EditorDocument } from "./types";

vi.mock("../filesystem/fs", () => ({
  writeFile: vi.fn(),
  saveFileAs: vi.fn(),
}));

const fs = await import("../filesystem/fs");
const { useDocumentsStore, isDirty } = await import("./documentsStore");

function doc(overrides: Partial<EditorDocument>): EditorDocument {
  return { id: "doc", path: null, title: "Untitled-1", content: "", savedContent: "", lineEnding: "lf", ...overrides };
}

beforeEach(() => {
  vi.mocked(fs.writeFile).mockReset().mockResolvedValue(undefined);
  vi.mocked(fs.saveFileAs).mockReset().mockResolvedValue(null);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("autosaveAll", () => {
  it("never opens a Save As dialog for untitled documents", async () => {
    useDocumentsStore.setState({ documents: [doc({ id: "u", content: "draft" })], activeId: "u" });

    await useDocumentsStore.getState().autosaveAll();

    expect(fs.saveFileAs).not.toHaveBeenCalled();
    expect(isDirty(useDocumentsStore.getState().documents[0])).toBe(true);
  });

  it("saves every modified document with a path, not only the active one", async () => {
    useDocumentsStore.setState({
      documents: [
        doc({ id: "a", path: "C:\\notes\\a.md", content: "a2", savedContent: "a1" }),
        doc({ id: "b", path: "C:\\notes\\b.md", content: "b2", savedContent: "b1", lineEnding: "crlf" }),
        doc({ id: "c", path: "C:\\notes\\c.md", content: "same", savedContent: "same" }),
      ],
      activeId: "a",
    });

    await useDocumentsStore.getState().autosaveAll();

    expect(fs.writeFile).toHaveBeenCalledTimes(2);
    expect(fs.writeFile).toHaveBeenCalledWith("C:\\notes\\a.md", "a2");
    expect(fs.writeFile).toHaveBeenCalledWith("C:\\notes\\b.md", "b2");
    expect(useDocumentsStore.getState().documents.every((d) => !isDirty(d))).toBe(true);
  });

  it("keeps going and leaves the document dirty when a write fails", async () => {
    vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error("locked"));
    useDocumentsStore.setState({
      documents: [
        doc({ id: "a", path: "C:\\notes\\a.md", content: "a2", savedContent: "a1" }),
        doc({ id: "b", path: "C:\\notes\\b.md", content: "b2", savedContent: "b1" }),
      ],
      activeId: "a",
    });

    await expect(useDocumentsStore.getState().autosaveAll()).resolves.toBeUndefined();

    const [a, b] = useDocumentsStore.getState().documents;
    expect(isDirty(a)).toBe(true);
    expect(isDirty(b)).toBe(false);
  });
});
