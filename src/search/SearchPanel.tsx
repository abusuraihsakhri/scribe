import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronUp, ChevronDown, Regex, CaseSensitive, WholeWord } from "lucide-react";
import type { EditorView } from "@codemirror/view";

interface SearchPanelProps {
  editorRef: React.MutableRefObject<EditorView | null>;
  mode: "search" | "replace";
  onClose: () => void;
}

export function SearchPanel({ editorRef, mode, onClose }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const findMatches = useCallback(() => {
    const view = editorRef.current;
    if (!view || !query) { setMatchCount(0); setCurrentMatch(0); return []; }

    const text = view.state.doc.toString();
    const flags = caseSensitive ? "g" : "gi";
    let pattern: RegExp;
    try {
      const escaped = useRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const wrapped = wholeWord ? `\\b${escaped}\\b` : escaped;
      pattern = new RegExp(wrapped, flags);
    } catch {
      setMatchCount(0); setCurrentMatch(0); return [];
    }

    const matches: { from: number; to: number }[] = [];
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
      matches.push({ from: m.index, to: m.index + m[0].length });
      if (m[0].length === 0) {
        if (pattern.lastIndex === m.index) {
          pattern.lastIndex++;
        }
      }
      if (matches.length > 10000) break;
    }
    setMatchCount(matches.length);
    return matches;
  }, [editorRef, query, caseSensitive, wholeWord, useRegex]);

  const highlightMatches = useCallback(() => {
    const view = editorRef.current;
    if (!view) return;

    import("@codemirror/search").then(({ setSearchQuery, SearchQuery }) => {
      view.dispatch({
        effects: setSearchQuery.of(new SearchQuery({
          search: query || "",
          caseSensitive,
          wholeWord,
          regexp: useRegex,
        })),
      });
    });
  }, [editorRef, query, caseSensitive, wholeWord, useRegex]);

  useEffect(() => {
    findMatches();
    highlightMatches();
  }, [findMatches, highlightMatches]);

  function findNext() {
    const matches = findMatches();
    if (matches.length === 0) return;
    const next = (currentMatch + 1) % matches.length;
    setCurrentMatch(next);
    navigateToMatch(matches[next]);
  }

  function findPrev() {
    const matches = findMatches();
    if (matches.length === 0) return;
    const prev = (currentMatch - 1 + matches.length) % matches.length;
    setCurrentMatch(prev);
    navigateToMatch(matches[prev]);
  }

  function navigateToMatch(match: { from: number; to: number }) {
    const view = editorRef.current;
    if (!view) return;
    view.dispatch({
      selection: { anchor: match.from, head: match.to },
      scrollIntoView: true,
    });
    view.focus();
  }

  function replaceCurrent() {
    const view = editorRef.current;
    if (!view || matchCount === 0) return;
    const matches = findMatches();
    if (matches.length === 0) return;
    const match = matches[currentMatch % matches.length];
    view.dispatch({
      changes: { from: match.from, to: match.to, insert: replaceText },
    });
    // Re-search after replace
    setTimeout(() => findNext(), 0);
  }

  function replaceAll() {
    const view = editorRef.current;
    if (!view || !query) return;
    const text = view.state.doc.toString();
    const flags = caseSensitive ? "g" : "gi";
    let pattern: RegExp;
    try {
      const escaped = useRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const wrapped = wholeWord ? `\\b${escaped}\\b` : escaped;
      pattern = new RegExp(wrapped, flags);
    } catch { return; }

    const newText = text.replace(pattern, () => replaceText);
    if (newText !== text) {
      view.dispatch({ changes: { from: 0, to: text.length, insert: newText } });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "Enter" && e.shiftKey) { findPrev(); return; }
    if (e.key === "Enter") { findNext(); }
  }

  return (
    <div
      className="flex flex-col gap-1.5 overflow-x-auto border-b border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2"
      onKeyDown={handleKeyDown}
    >
      {/* Find row */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center rounded-md border border-[var(--border)] bg-[var(--bg-app)] focus-within:border-[var(--accent)]">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCurrentMatch(0); }}
            placeholder="Find..."
            className="h-7 w-52 bg-transparent px-2 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
          />
          <div className="flex items-center gap-0.5 px-1">
            <button
              type="button"
              onClick={() => setCaseSensitive(!caseSensitive)}
              title="Match case"
              className={`flex h-5 w-5 items-center justify-center rounded text-[11px] ${caseSensitive ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
            >
              <CaseSensitive size={14} />
            </button>
            <button
              type="button"
              onClick={() => setWholeWord(!wholeWord)}
              title="Match whole word"
              className={`flex h-5 w-5 items-center justify-center rounded text-[11px] ${wholeWord ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
            >
              <WholeWord size={14} />
            </button>
            <button
              type="button"
              onClick={() => setUseRegex(!useRegex)}
              title="Use regex"
              className={`flex h-5 w-5 items-center justify-center rounded text-[11px] ${useRegex ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
            >
              <Regex size={14} />
            </button>
          </div>
        </div>

        <span className="min-w-[60px] text-[11.5px] text-[var(--text-tertiary)]">
          {query ? (matchCount > 0 ? `${currentMatch + 1} of ${matchCount}` : "No results") : ""}
        </span>

        <button type="button" onClick={findPrev} title="Previous" className="flex h-7 w-7 items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
          <ChevronUp size={14} />
        </button>
        <button type="button" onClick={findNext} title="Next" className="flex h-7 w-7 items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
          <ChevronDown size={14} />
        </button>
        <button type="button" onClick={onClose} title="Close (Escape)" className="flex h-7 w-7 items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
          <X size={14} />
        </button>
      </div>

      {/* Replace row */}
      {mode === "replace" && (
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-md border border-[var(--border)] bg-[var(--bg-app)] focus-within:border-[var(--accent)]">
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replace..."
              className="h-7 w-52 bg-transparent px-2 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
            />
          </div>
          <button
            type="button"
            onClick={replaceCurrent}
            className="rounded-md px-2.5 py-1 text-[12px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={replaceAll}
            className="rounded-md px-2.5 py-1 text-[12px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            Replace All
          </button>
        </div>
      )}
    </div>
  );
}
