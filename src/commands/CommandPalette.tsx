import { useState, useEffect, useRef, useMemo } from "react";
import type { Command } from "./commands";
import { fuzzyMatch } from "./commands";

interface CommandPaletteProps {
  commands: Command[];
  onClose: () => void;
}

export function CommandPalette({ commands, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    return commands.filter((c) => fuzzyMatch(query, c.label));
  }, [commands, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = list.children;
    const item = items[selectedIndex] as HTMLElement | undefined;
    if (item) {
      item.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  function executeCommand(cmd: Command) {
    onClose();
    cmd.action();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        onClose();
        break;
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => filtered.length === 0 ? 0 : Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => filtered.length === 0 ? 0 : Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[selectedIndex]) executeCommand(filtered[selectedIndex]);
        break;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div
        className="w-[480px] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-elevated)]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center border-b border-[var(--border)] px-3">
          <span className="text-[var(--text-tertiary)]">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command..."
            className="h-10 flex-1 bg-transparent px-2 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
          />
        </div>

        {/* Command list */}
        <div ref={listRef} className="max-h-[320px] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-[13px] text-[var(--text-tertiary)]">No matching commands</div>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={[
                    "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                    i === selectedIndex ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--bg-hover)]",
                  ].join(" ")}
                >
                  <Icon size={15} className="shrink-0 text-[var(--text-tertiary)]" />
                  <span className="flex-1 text-[13px] text-[var(--text-primary)]">{cmd.label}</span>
                  {cmd.shortcut && (
                    <span className="text-[11.5px] text-[var(--text-tertiary)]">{cmd.shortcut}</span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 border-t border-[var(--border)] px-3 py-1.5 text-[11px] text-[var(--text-tertiary)]">
          <span>↑↓ Navigate</span>
          <span>↵ Execute</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
