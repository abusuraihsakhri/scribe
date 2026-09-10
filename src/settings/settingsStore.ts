import { create } from "zustand";
import type { ThemeMode } from "../state/types";

const SETTINGS_KEY = "scribe.settings";

export interface AppSettings {
  editorFontFamily: string;
  editorFontSize: number;
  editorTabSize: number;
  editorWordWrap: boolean;
  editorLineNumbers: boolean;
  editorHighlightLine: boolean;
  theme: ThemeMode;
  autosave: boolean;
  autosaveIntervalMs: number;
  confirmBeforeClose: boolean;
}

const DEFAULTS: AppSettings = {
  editorFontFamily: "Cascadia Code",
  editorFontSize: 14.5,
  editorTabSize: 2,
  editorWordWrap: true,
  editorLineNumbers: true,
  editorHighlightLine: true,
  theme: "system",
  autosave: false,
  autosaveIntervalMs: 30000,
  confirmBeforeClose: true,
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

function persist(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

interface SettingsState extends AppSettings {
  update: (partial: Partial<AppSettings>) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => {
  const initial = loadSettings();
  return {
    ...initial,
    update: (partial) => {
      set((state) => {
        const next = { ...state, ...partial };
        persist(next);
        return partial;
      });
    },
    reset: () => {
      persist(DEFAULTS);
      set({ ...DEFAULTS });
    },
  };
});
