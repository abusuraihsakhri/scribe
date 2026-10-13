import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDocumentsStore, isDirty } from "./documentsStore";
import { writeFile, saveFileAs } from "../filesystem/fs";

vi.mock("../filesystem/fs", () => ({
  writeFile: vi.fn(),
  saveFileAs: vi.fn(),
}));

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => { resolve = r; });
  return { promise, resolve };
}

beforeEach(() => {
  vi.resetAllMocks();
  useDocumentsStore.setState({ documents: [], activeId: null });
});

describe("document persistence", () => {
  it("preserves the dirty flag for edits made during a pending write", async () => {
    const gate = deferred();
    vi.mocked(writeFile).mockImplementation(() => gate.promise);
    const id = useDocumentsStore.getState().openFromDisk({
      path: "/tmp/note.md", name: "note.md", content: "original",
    });
    useDocumentsStore.getState().updateContent(id, "first");
    const saving = useDocumentsStore.getState().save(id);
    await Promise.resolve(); // let the queued write begin before editing again
    useDocumentsStore.getState().updateContent(id, "second");
    gate.resolve();
    expect(await saving).toBe(true);
    const doc = useDocumentsStore.getState().activeDocument()!;
    expect(doc.savedContent).toBe("first");
    expect(doc.content).toBe("second");
    expect(isDirty(doc)).toBe(true);
  });

  it("serializes concurrent saves in order", async () => {
    const gate = deferred();
    vi.mocked(writeFile).mockImplementationOnce(() => gate.promise).mockResolvedValue(undefined);
    const id = useDocumentsStore.getState().openFromDisk({
      path: "/tmp/note.md", name: "note.md", content: "",
    });
    useDocumentsStore.getState().updateContent(id, "one");
    const first = useDocumentsStore.getState().save(id);
    await Promise.resolve(); // first write is now pending
    useDocumentsStore.getState().updateContent(id, "two");
    const second = useDocumentsStore.getState().save(id);
    expect(vi.mocked(writeFile)).toHaveBeenCalledTimes(1);
    gate.resolve();
    await Promise.all([first, second]);
    expect(vi.mocked(writeFile).mock.calls.map((call) => call[1])).toEqual(["one", "two"]);
    expect(isDirty(useDocumentsStore.getState().activeDocument()!)).toBe(false);
  });

  it("does not mark a document saved if Save As is cancelled", async () => {
    vi.mocked(saveFileAs).mockResolvedValue(null);
    const id = useDocumentsStore.getState().newDocument();
    useDocumentsStore.getState().updateContent(id, "draft");
    expect(await useDocumentsStore.getState().save(id)).toBe(false);
    const doc = useDocumentsStore.getState().activeDocument()!;
    expect(doc.path).toBeNull();
    expect(isDirty(doc)).toBe(true);
  });
});
