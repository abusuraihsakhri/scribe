import { create } from "zustand";
import type { EditorDocument } from "./types";
import { isDirty } from "./types";
import { saveFileAs, writeFile, type OpenedFile } from "../filesystem/fs";
import { applyLineEnding } from "../utils/lineEndings";

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
    lineEnding: "lf",
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

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
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
      lineEnding: file.lineEnding,
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

  save: async (id) => {
    const doc = get().documents.find((d) => d.id === id);
    if (!doc) return false;
    if (!doc.path) {
      return get().saveAs(id);
    }
    await writeFile(doc.path, applyLineEnding(doc.content, doc.lineEnding));
    set((state) => ({
      documents: state.documents.map((d) => (d.id === id ? { ...d, savedContent: d.content } : d)),
    }));
    return true;
  },

  saveAs: async (id) => {
    const doc = get().documents.find((d) => d.id === id);
    if (!doc) return false;
    const path = await saveFileAs(applyLineEnding(doc.content, doc.lineEnding), doc.path ?? `${doc.title}.md`);
    if (!path) return false;
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, path, title: titleFromPath(path), savedContent: d.content } : d,
      ),
    }));
    return true;
  },

  reloadFromDisk: (id, content) => {
    set((state) => ({
      documents: state.documents.map((d) => (d.id === id ? { ...d, content, savedContent: content } : d)),
    }));
  },
}));

export { isDirty };
