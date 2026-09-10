import { useState } from "react";
import { X } from "lucide-react";
import { useSettingsStore } from "./settingsStore";
import { useUIStore } from "../state/uiStore";

interface SettingsDialogProps {
  onClose: () => void;
}

type SettingsTab = "editor" | "appearance" | "files";

export function SettingsDialog({ onClose }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("editor");
  const settings = useSettingsStore();
  const update = useSettingsStore((s) => s.update);
  const sidebarVisible = useUIStore((s) => s.sidebarVisible);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: "editor", label: "Editor" },
    { id: "appearance", label: "Appearance" },
    { id: "files", label: "Files" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="flex h-[480px] w-[600px] flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-elevated)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-[var(--border)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "px-4 py-2 text-[13px] font-medium transition-colors",
                activeTab === tab.id
                  ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "editor" && (
            <div className="flex flex-col gap-4">
              <SettingRow label="Font Family">
                <select
                  value={settings.editorFontFamily}
                  onChange={(e) => update({ editorFontFamily: e.target.value })}
                  className="h-8 rounded-md border border-[var(--border)] bg-[var(--bg-app)] px-2 text-[13px] text-[var(--text-primary)]"
                >
                  <option value="Cascadia Code">Cascadia Code</option>
                  <option value="Consolas">Consolas</option>
                  <option value="JetBrains Mono">JetBrains Mono</option>
                  <option value="monospace">System Monospace</option>
                </select>
              </SettingRow>
              <SettingRow label="Font Size">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={10}
                    max={24}
                    step={0.5}
                    value={settings.editorFontSize}
                    onChange={(e) => update({ editorFontSize: parseFloat(e.target.value) })}
                    className="w-40"
                  />
                  <span className="w-12 text-[12px] text-[var(--text-secondary)]">{settings.editorFontSize}px</span>
                </div>
              </SettingRow>
              <SettingRow label="Tab Size">
                <div className="flex gap-2">
                  {[2, 4, 8].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => update({ editorTabSize: size })}
                      className={[
                        "rounded-md px-3 py-1 text-[12px] transition-colors",
                        settings.editorTabSize === size
                          ? "bg-[var(--accent)] text-[var(--text-on-accent)]"
                          : "border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
                      ].join(" ")}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </SettingRow>
              <SettingRow label="Word Wrap">
                <Toggle checked={settings.editorWordWrap} onChange={(v) => update({ editorWordWrap: v })} />
              </SettingRow>
              <SettingRow label="Line Numbers">
                <Toggle checked={settings.editorLineNumbers} onChange={(v) => update({ editorLineNumbers: v })} />
              </SettingRow>
              <SettingRow label="Highlight Current Line">
                <Toggle checked={settings.editorHighlightLine} onChange={(v) => update({ editorHighlightLine: v })} />
              </SettingRow>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="flex flex-col gap-4">
              <SettingRow label="Theme">
                <div className="flex gap-2">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => update({ theme: t })}
                      className={[
                        "rounded-md px-3 py-1 text-[12px] capitalize transition-colors",
                        settings.theme === t
                          ? "bg-[var(--accent)] text-[var(--text-on-accent)]"
                          : "border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
                      ].join(" ")}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </SettingRow>
              <SettingRow label="Sidebar Visible">
                <Toggle checked={sidebarVisible} onChange={toggleSidebar} />
              </SettingRow>
            </div>
          )}

          {activeTab === "files" && (
            <div className="flex flex-col gap-4">
              <SettingRow label="Autosave">
                <Toggle checked={settings.autosave} onChange={(v) => update({ autosave: v })} />
              </SettingRow>
              {settings.autosave && (
                <SettingRow label="Autosave Interval">
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={5000}
                      max={120000}
                      step={5000}
                      value={settings.autosaveIntervalMs}
                      onChange={(e) => update({ autosaveIntervalMs: parseInt(e.target.value) })}
                      className="w-40"
                    />
                    <span className="w-16 text-[12px] text-[var(--text-secondary)]">{(settings.autosaveIntervalMs / 1000).toFixed(0)}s</span>
                  </div>
                </SettingRow>
              )}
              <SettingRow label="Confirm Before Close">
                <Toggle checked={settings.confirmBeforeClose} onChange={(v) => update({ confirmBeforeClose: v })} />
              </SettingRow>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-[var(--text-primary)]">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "relative h-5 w-9 rounded-full transition-colors",
        checked ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
          checked ? "left-[18px]" : "left-0.5",
        ].join(" ")}
      />
    </button>
  );
}
