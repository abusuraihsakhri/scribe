import { create } from "zustand";

const RECENT_KEY = "scribe.recentFiles";
const MAX_RECENT = 25;

export interface RecentFile {
  path: string;
  name: string;
  lastOpened: number;
}

function loadRecent(): RecentFile[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentFile[];
  } catch {
    return [];
  }
}

function persist(files: RecentFile[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(files));
}

interface RecentFilesState {
  recentFiles: RecentFile[];
  addRecent: (path: string, name: string) => void;
  removeRecent: (path: string) => void;
  clearRecent: () => void;
}

export const useRecentFilesStore = create<RecentFilesState>((set) => ({
  recentFiles: loadRecent(),
  addRecent: (path, name) => {
    set((state) => {
      const filtered = state.recentFiles.filter((f) => f.path !== path);
      const updated = [{ path, name, lastOpened: Date.now() }, ...filtered].slice(0, MAX_RECENT);
      persist(updated);
      return { recentFiles: updated };
    });
  },
  removeRecent: (path) => {
    set((state) => {
      const updated = state.recentFiles.filter((f) => f.path !== path);
      persist(updated);
      return { recentFiles: updated };
    });
  },
  clearRecent: () => {
    persist([]);
    set({ recentFiles: [] });
  },
}));
