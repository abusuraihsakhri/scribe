import { create } from "zustand";
import type { EditorDocument } from "./types";
import { isDirty } from "./types";
import { openFileAtPath, saveFileAs, writeFile, type OpenedFile } from "../filesystem/fs";
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
  /** Saves every modified document that already has a file. Untitled documents are skipped so autosave never opens a dialog. */
  autosaveAll: () => Promise<void>;
  /**
   * Compares every open file with its copy on disk. Unmodified documents are reloaded silently;
   * for documents with unsaved edits, confirmReload decides whether the disk version wins.
   */
  syncWithDisk: (confirmReload: (title: string) => Promise<boolean>) => Promise<void>;
}

/** Reads the file at doc.path, or null if it is gone or unreadable (e.g. deleted or on an unplugged drive). */
async function readDiskVersion(path: string): Promise<OpenedFile | null> {
  try {
    return await openFileAtPath(path);
  } catch {
    return null;
  }
}

// While a save is in flight the disk briefly differs from savedContent; don't mistake that for an external edit.
let savesInFlight = 0;
let syncing = false;

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
    // Stays counted until savedContent is updated, so syncWithDisk never sees the new file with the old baseline.
    savesInFlight++;
    try {
      await writeFile(doc.path, applyLineEnding(doc.content, doc.lineEnding));
      // Record what was written, not the current content: edits made during the write are still unsaved.
      set((state) => ({
        documents: state.documents.map((d) => (d.id === id ? { ...d, savedContent: doc.content } : d)),
      }));
    } finally {
      savesInFlight--;
    }
    return true;
  },

  saveAs: async (id) => {
    const doc = get().documents.find((d) => d.id === id);
    if (!doc) return false;
    savesInFlight++;
    try {
      const path = await saveFileAs(applyLineEnding(doc.content, doc.lineEnding), doc.path ?? `${doc.title}.md`);
      if (!path) return false;
      set((state) => ({
        documents: state.documents.map((d) =>
          d.id === id ? { ...d, path, title: titleFromPath(path), savedContent: doc.content } : d,
        ),
      }));
      return true;
    } finally {
      savesInFlight--;
    }
  },

  autosaveAll: async () => {
    const pending = get().documents.filter((d) => d.path && isDirty(d));
    for (const doc of pending) {
      // Another program changed the file since we last read it: leave it for syncWithDisk to ask about.
      const onDisk = await readDiskVersion(doc.path!);
      if (onDisk && onDisk.content !== doc.savedContent) continue;
      try {
        await get().save(doc.id);
      } catch (err) {
        // The document stays dirty, so its unsaved marker remains visible in the tab.
        console.error(`Autosave failed for ${doc.path}:`, err);
      }
    }
  },

  syncWithDisk: async (confirmReload) => {
    if (syncing || savesInFlight > 0) return;
    syncing = true;
    try {
      for (const doc of get().documents) {
        if (!doc.path) continue;
        const onDisk = await readDiskVersion(doc.path);
        // Compare against fresh state: a save may have finished (or started) while the file was being read.
        const current = get().documents.find((d) => d.id === doc.id);
        if (!onDisk || !current || savesInFlight > 0 || onDisk.content === current.savedContent) continue;

        const reload = !isDirty(current) || (await confirmReload(current.title));
        set((state) => ({
          documents: state.documents.map((d) => {
            if (d.id !== doc.id) return d;
            // Keeping edits: the disk version becomes the baseline, so the tab stays dirty and the next save overwrites it.
            return reload
              ? { ...d, content: onDisk.content, savedContent: onDisk.content, lineEnding: onDisk.lineEnding }
              : { ...d, savedContent: onDisk.content };
          }),
        }));
      }
    } finally {
      syncing = false;
    }
  },
}));

export { isDirty };
