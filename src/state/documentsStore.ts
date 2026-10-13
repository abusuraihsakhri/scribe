import { create } from "zustand";
import type { EditorDocument } from "./types";
import { isDirty } from "./types";
import { saveFileAs, writeFile, type OpenedFile } from "../filesystem/fs";

// Serialize writes per document so overlapping autosave/manual saves cannot race.
const pendingSaves = new Map<string, Promise<void>>();

async function withSaveLock<T>(id: string, operation: () => Promise<T>): Promise<T> {
  const previous = pendingSaves.get(id) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => { release = resolve; });
  pendingSaves.set(id, current);
  await previous;
  try {
    return await operation();
  } finally {
    release();
    if (pendingSaves.get(id) === current) pendingSaves.delete(id);
  }
}

let untitledCounter = 1;
let idCounter = 1;
const nextId = () => `doc-${idCounter++}`;

function titleFromPath(path: string): string {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1] ?? path;
}

function makeUntitledDocument(): EditorDocument {
  return {
    id: nextId(),
    path: null,
    title: `Untitled-${untitledCounter++}`,
    content: "",
    savedContent: "",
  };
}

interface DocumentsState {
  documents: EditorDocument[];
  activeId: string | null;

  activeDocument: () => EditorDocument | null;
  newDocument: () => string;
  openFromDisk: (file: OpenedFile) => string;
  updateContent: (id: string, content: string) => void;
  setActive: (id: string) => void;
  closeDocument: (id: string) => void;
  save: (id: string) => Promise<boolean>;
  saveAs: (id: string) => Promise<boolean>;
  /** Reloads a document's content from an externally-modified file on disk. */
  reloadFromDisk: (id: string, content: string) => void;
}

export const useDocumentsStore = create<DocumentsState>((set, get) => {
  async function persistDocument(id: string, saveAs: boolean): Promise<boolean> {
    return withSaveLock(id, async () => {
      const doc = get().documents.find((d) => d.id === id);
      if (!doc) return false;
      const savedSnapshot = doc.content;
      let path = doc.path;
      if (saveAs || !path) {
        path = await saveFileAs(savedSnapshot, doc.path ?? `${doc.title}.md`);
        if (!path) return false;
      } else {
        await writeFile(path, savedSnapshot);
      }
      const savedPath = path;
      set((state) => ({
        documents: state.documents.map((d) =>
          d.id === id ? { ...d, path: savedPath, title: titleFromPath(savedPath), savedContent: savedSnapshot } : d,
        ),
      }));
      return true;
    });
  }

  return ({
  documents: [],
  activeId: null,

  activeDocument: () => {
    const { documents, activeId } = get();
    return documents.find((d) => d.id === activeId) ?? null;
  },

  newDocument: () => {
    const doc = makeUntitledDocument();
    set((state) => ({ documents: [...state.documents, doc], activeId: doc.id }));
    return doc.id;
  },

  openFromDisk: (file) => {
    const existing = get().documents.find((d) => d.path === file.path);
    if (existing) {
      set({ activeId: existing.id });
      return existing.id;
    }
    const doc: EditorDocument = {
      id: nextId(),
      path: file.path,
      title: file.name,
      content: file.content,
      savedContent: file.content,
    };
    set((state) => ({ documents: [...state.documents, doc], activeId: doc.id }));
    return doc.id;
  },

  updateContent: (id, content) => {
    set((state) => ({
      documents: state.documents.map((d) => (d.id === id ? { ...d, content } : d)),
    }));
  },

  setActive: (id) => set({ activeId: id }),

  closeDocument: (id) => {
    set((state) => {
      const remaining = state.documents.filter((d) => d.id !== id);
      let activeId = state.activeId;
      if (activeId === id) {
        const closedIndex = state.documents.findIndex((d) => d.id === id);
        activeId = remaining[Math.max(0, closedIndex - 1)]?.id ?? remaining[0]?.id ?? null;
      }
      return { documents: remaining, activeId };
    });
  },

  save: (id) => persistDocument(id, false),

  saveAs: (id) => persistDocument(id, true),

  reloadFromDisk: (id, content) => {
    set((state) => ({
      documents: state.documents.map((d) => (d.id === id ? { ...d, content, savedContent: content } : d)),
    }));
  },
}));

export { isDirty };
