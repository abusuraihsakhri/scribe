import { create } from "zustand";
import type { ThemeMode, ViewMode } from "./types";

const THEME_STORAGE_KEY = "scribe.theme";

function loadStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

function applyThemeToDocument(theme: ThemeMode) {
  document.documentElement.setAttribute("data-theme", theme);
}

interface UIState {
  viewMode: ViewMode;
  sidebarVisible: boolean;
  theme: ThemeMode;

  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const initialTheme = loadStoredTheme();
applyThemeToDocument(initialTheme);

export const useUIStore = create<UIState>((set) => ({
  viewMode: "split",
  sidebarVisible: true,
  theme: initialTheme,

  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),
  setTheme: (theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyThemeToDocument(theme);
    set({ theme });
  },
}));
