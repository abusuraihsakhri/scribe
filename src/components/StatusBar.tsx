import type { LineEnding } from "../state/types";

interface StatusBarProps {
  words: number;
  characters: number;
  line: number;
  column: number;
  lineEnding?: LineEnding;
}

export function StatusBar({ words, characters, line, column, lineEnding = "lf" }: StatusBarProps) {

  return (
    <div className="flex h-6 shrink-0 items-center justify-between border-t border-[var(--border)] bg-[var(--bg-surface)] px-3 text-[11.5px] text-[var(--text-tertiary)]">
      <div className="flex items-center gap-3">
        <span>Markdown</span>
        <span>UTF-8</span>
        <span>{lineEnding.toUpperCase()}</span>
      </div>
      <div className="flex items-center gap-3">
        <span>
          Ln {line}, Col {column}
        </span>
        <span>{words.toLocaleString()} words</span>
        <span>{characters.toLocaleString()} chars</span>
      </div>
    </div>
  );
}
