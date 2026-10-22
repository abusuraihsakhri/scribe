import { describe, it, expect, vi, beforeEach } from "vitest";
import type { EditorDocument } from "./types";

vi.mock("../filesystem/fs", () => ({
  writeFile: vi.fn(),
  saveFileAs: vi.fn(),
  openFileAtPath: vi.fn(),
}));

const fs = await import("../filesystem/fs");
const { useDocumentsStore, isDirty } = await import("./documentsStore");

function doc(overrides: Partial<EditorDocument>): EditorDocument {
  return { id: "doc", path: null, title: "Untitled-1", content: "", savedContent: "", lineEnding: "lf", ...overrides };
}

beforeEach(() => {
  vi.mocked(fs.writeFile).mockReset().mockResolvedValue(undefined);
  vi.mocked(fs.saveFileAs).mockReset().mockResolvedValue(null);
  vi.mocked(fs.openFileAtPath).mockReset().mockRejectedValue(new Error("not found"));
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("save", () => {
  it("keeps edits made during the write marked as unsaved", async () => {
    let finishWrite!: () => void;
    vi.mocked(fs.writeFile).mockImplementationOnce(() => new Promise<void>((resolve) => { finishWrite = resolve; }));
    useDocumentsStore.setState({
      documents: [doc({ id: "a", path: "C:\\notes\\a.md", content: "v1", savedContent: "v0" })],
      activeId: "a",
    });

    const saving = useDocumentsStore.getState().save("a");
    useDocumentsStore.getState().updateContent("a", "v2");
    finishWrite();
    await saving;

    const [a] = useDocumentsStore.getState().documents;
    expect(fs.writeFile).toHaveBeenCalledWith("C:\\notes\\a.md", "v1");
    expect(a.savedContent).toBe("v1");
    expect(isDirty(a)).toBe(true);
  });

  it("keeps edits made while the Save As dialog is open marked as unsaved", async () => {
    let choosePath!: (path: string) => void;
    vi.mocked(fs.saveFileAs).mockImplementationOnce(() => new Promise<string>((resolve) => { choosePath = resolve; }));
    useDocumentsStore.setState({ documents: [doc({ id: "u", content: "v1" })], activeId: "u" });

    const saving = useDocumentsStore.getState().saveAs("u");
    useDocumentsStore.getState().updateContent("u", "v2");
    choosePath("C:\\notes\\new.md");
    await saving;

    const [u] = useDocumentsStore.getState().documents;
    expect(u.savedContent).toBe("v1");
    expect(isDirty(u)).toBe(true);
  });
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

describe("external changes", () => {
  const onDisk = (content: string) => ({ path: "C:\notes\a.md", name: "a.md", content, lineEnding: "lf" as const });

  it("autosave skips a file that another program changed, so it is not overwritten", async () => {
    vi.mocked(fs.openFileAtPath).mockResolvedValue(onDisk("edited elsewhere"));
    useDocumentsStore.setState({
      documents: [doc({ id: "a", path: "C:\notes\a.md", content: "mine", savedContent: "original" })],
      activeId: "a",
    });

    await useDocumentsStore.getState().autosaveAll();

    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it("reloads an unmodified document without asking", async () => {
    vi.mocked(fs.openFileAtPath).mockResolvedValue(onDisk("new"));
    useDocumentsStore.setState({
      documents: [doc({ id: "a", path: "C:\notes\a.md", content: "old", savedContent: "old" })],
      activeId: "a",
    });
    const confirmReload = vi.fn();

    await useDocumentsStore.getState().syncWithDisk(confirmReload);

    expect(confirmReload).not.toHaveBeenCalled();
    expect(useDocumentsStore.getState().documents[0]).toMatchObject({ content: "new", savedContent: "new" });
  });

  it("asks before replacing unsaved edits, and reloads when confirmed", async () => {
    vi.mocked(fs.openFileAtPath).mockResolvedValue(onDisk("new"));
    useDocumentsStore.setState({
      documents: [doc({ id: "a", path: "C:\notes\a.md", title: "a.md", content: "mine", savedContent: "old" })],
      activeId: "a",
    });
    const confirmReload = vi.fn().mockResolvedValue(true);

    await useDocumentsStore.getState().syncWithDisk(confirmReload);

    expect(confirmReload).toHaveBeenCalledWith("a.md");
    expect(useDocumentsStore.getState().documents[0]).toMatchObject({ content: "new", savedContent: "new" });
  });

  it("keeps unsaved edits when declined, and does not ask again for the same disk version", async () => {
    vi.mocked(fs.openFileAtPath).mockResolvedValue(onDisk("new"));
    useDocumentsStore.setState({
      documents: [doc({ id: "a", path: "C:\notes\a.md", content: "mine", savedContent: "old" })],
      activeId: "a",
    });
    const confirmReload = vi.fn().mockResolvedValue(false);

    await useDocumentsStore.getState().syncWithDisk(confirmReload);
    await useDocumentsStore.getState().syncWithDisk(confirmReload);

    expect(confirmReload).toHaveBeenCalledTimes(1);
    const [a] = useDocumentsStore.getState().documents;
    expect(a).toMatchObject({ content: "mine", savedContent: "new" });
    expect(isDirty(a)).toBe(true);
  });

  it("does not mistake Scribe's own save, finishing mid-check, for an external edit", async () => {
    useDocumentsStore.setState({
      documents: [
        doc({ id: "a", path: "C:\\notes\\a.md", content: "a", savedContent: "a" }),
        doc({ id: "b", path: "C:\\notes\\b.md", content: "b2", savedContent: "b1" }),
      ],
      activeId: "a",
    });
    // While the check reads a.md, b.md is saved; the check then reads b.md's new contents.
    vi.mocked(fs.openFileAtPath).mockImplementation(async (path) => {
      if (path.endsWith("a.md")) {
        await useDocumentsStore.getState().save("b");
        useDocumentsStore.getState().updateContent("b", "b3");
        return { ...onDisk("a"), path };
      }
      return { ...onDisk("b2"), path };
    });
    const confirmReload = vi.fn();

    await useDocumentsStore.getState().syncWithDisk(confirmReload);

    expect(confirmReload).not.toHaveBeenCalled();
    expect(useDocumentsStore.getState().documents[1]).toMatchObject({ content: "b3", savedContent: "b2" });
  });

  it("skips the check while a Save As write is in flight", async () => {
    let finishWrite!: (path: string) => void;
    vi.mocked(fs.saveFileAs).mockImplementationOnce(() => new Promise<string>((resolve) => { finishWrite = resolve; }));
    vi.mocked(fs.openFileAtPath).mockResolvedValue(onDisk("new"));
    useDocumentsStore.setState({
      documents: [doc({ id: "a", path: "C:\\notes\\a.md", content: "new", savedContent: "old" })],
      activeId: "a",
    });
    const confirmReload = vi.fn();

    const saving = useDocumentsStore.getState().saveAs("a");
    await useDocumentsStore.getState().syncWithDisk(confirmReload);
    finishWrite("C:\\notes\\a.md");
    await saving;

    expect(confirmReload).not.toHaveBeenCalled();
  });

  it("leaves documents alone when their file can't be read", async () => {
    useDocumentsStore.setState({
      documents: [doc({ id: "a", path: "C:\notes\gone.md", content: "old", savedContent: "old" })],
      activeId: "a",
    });

    await useDocumentsStore.getState().syncWithDisk(vi.fn());

    expect(useDocumentsStore.getState().documents[0].content).toBe("old");
  });
});
