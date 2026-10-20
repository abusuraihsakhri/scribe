import { useEffect, useRef } from "react";
import { EditorState, StateEffect, type Extension, Compartment } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  dropCursor,
  rectangularSelection,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, indentOnInput, indentUnit } from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { searchKeymap, search } from "@codemirror/search";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { markdownTheme } from "./codeEditorTheme";
import { smartEditingKeymap } from "./smartEditing";
import { applyFormat } from "./formatting";

interface CodeEditorProps {
  /** Identifies the open document; each one keeps its own undo history, selection, and scroll. */
  docId: string;
  value: string;
  onChange: (value: string) => void;
  editorRef?: React.MutableRefObject<EditorView | null>;
  onCursorInfo?: (info: { line: number; column: number }) => void;
  fontSize?: number;
  fontFamily?: string;
  wordWrap?: boolean;
  showLineNumbers?: boolean;
  highlightCurrentLine?: boolean;
  tabSize?: number;
}

interface SavedEditorState {
  state: EditorState;
  scroll: StateEffect<unknown>;
}

// The editor view is shared by all tabs. Swapping in each document's own EditorState, rather than
// replacing the text in place, keeps undo history from leaking between documents.
const savedStates = new Map<string, SavedEditorState>();

/** Drops saved editor state for documents that are no longer open. */
export function retainEditorStates(openIds: Set<string>) {
  for (const id of savedStates.keys()) {
    if (!openIds.has(id)) savedStates.delete(id);
  }
}

export function CodeEditor({ docId, value, onChange, editorRef, onCursorInfo, fontSize, fontFamily, wordWrap, showLineNumbers = true, highlightCurrentLine = true, tabSize = 2 }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const docIdRef = useRef(docId);
  const onChangeRef = useRef(onChange);
  const onCursorInfoRef = useRef(onCursorInfo);
  onChangeRef.current = onChange;
  onCursorInfoRef.current = onCursorInfo;

  // Compartments for dynamic settings
  const fontSizeCompartment = useRef(new Compartment());
  const fontFamilyCompartment = useRef(new Compartment());
  const lineWrappingCompartment = useRef(new Compartment());
  const lineNumbersCompartment = useRef(new Compartment());
  const activeLineCompartment = useRef(new Compartment());
  const tabSizeCompartment = useRef(new Compartment());

  function buildExtensions(): Extension[] {
    return [
      lineNumbersCompartment.current.of(showLineNumbers ? lineNumbers() : []),
      activeLineCompartment.current.of(highlightCurrentLine ? [highlightActiveLine(), highlightActiveLineGutter()] : []),
      history(),
      drawSelection(),
      dropCursor(),
      rectangularSelection(),
      bracketMatching(),
      closeBrackets(),
      indentOnInput(),
      tabSizeCompartment.current.of(indentUnit.of(" ".repeat(tabSize))),
      search({ top: true }),
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      fontSizeCompartment.current.of(EditorView.theme({ ".cm-content": { fontSize: `${fontSize ?? 14.5}px` } })),
      fontFamilyCompartment.current.of(EditorView.theme({ ".cm-content": { fontFamily: fontFamily ? `"${fontFamily}", var(--font-mono)` : "var(--font-mono)" } })),
      lineWrappingCompartment.current.of(wordWrap !== false ? EditorView.lineWrapping : []),
      smartEditingKeymap(),
      keymap.of([
        { key: "Mod-b", run: (view) => { applyFormat(view, "bold"); return true; } },
        { key: "Mod-i", run: (view) => { applyFormat(view, "italic"); return true; } },
        { key: "Mod-k", run: (view) => { applyFormat(view, "link"); return true; } },
      ]),
      keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...searchKeymap, indentWithTab]),
      markdownTheme(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current(update.state.doc.toString());
        }
        if (update.docChanged || update.selectionSet) {
          reportCursor(update.state);
        }
      }),
    ];
  }

  function reportCursor(state: EditorState) {
    const pos = state.selection.main.head;
    const line = state.doc.lineAt(pos);
    onCursorInfoRef.current?.({ line: line.number, column: pos - line.from + 1 });
  }

  function loadState(view: EditorView, id: string) {
    const saved = savedStates.get(id);
    if (saved) {
      view.setState(saved.state);
      // The saved state still holds the extensions (callbacks, settings) from when it was saved,
      // possibly from an earlier mount. Reinstall current ones; the undo history is kept.
      view.dispatch({ effects: [StateEffect.reconfigure.of(buildExtensions()), saved.scroll] });
    } else {
      view.setState(EditorState.create({ doc: value, extensions: buildExtensions() }));
    }
    reportCursor(view.state);
  }

  function saveState(view: EditorView) {
    savedStates.set(docIdRef.current, { state: view.state, scroll: view.scrollSnapshot() });
  }

  useEffect(() => {
    if (!hostRef.current) return;

    const view = new EditorView({ parent: hostRef.current });
    viewRef.current = view;
    if (editorRef) editorRef.current = view;
    loadState(view, docId);

    return () => {
      saveState(view);
      view.destroy();
      viewRef.current = null;
      if (editorRef) editorRef.current = null;
    };
    // Extensions are created once per mount; settings changes are applied via compartments below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch to the newly active document's state
  useEffect(() => {
    const view = viewRef.current;
    if (!view || docIdRef.current === docId) return;
    saveState(view);
    docIdRef.current = docId;
    loadState(view, docId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  // Sync document content on external changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  // Apply dynamic settings changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const effects = [];
    if (fontSize != null) {
      effects.push(fontSizeCompartment.current.reconfigure(EditorView.theme({ ".cm-content": { fontSize: `${fontSize}px` } })));
    }
    if (fontFamily != null) {
      effects.push(fontFamilyCompartment.current.reconfigure(EditorView.theme({ ".cm-content": { fontFamily: `"${fontFamily}", var(--font-mono)` } })));
    }
    if (effects.length > 0) {
      view.dispatch({ effects });
    }
  }, [fontSize, fontFamily]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: lineWrappingCompartment.current.reconfigure(wordWrap !== false ? EditorView.lineWrapping : []),
    });
  }, [wordWrap]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: lineNumbersCompartment.current.reconfigure(showLineNumbers ? lineNumbers() : []),
    });
  }, [showLineNumbers]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: activeLineCompartment.current.reconfigure(highlightCurrentLine ? [highlightActiveLine(), highlightActiveLineGutter()] : []),
    });
  }, [highlightCurrentLine]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: tabSizeCompartment.current.reconfigure(indentUnit.of(" ".repeat(tabSize))),
    });
  }, [tabSize]);

  return <div ref={hostRef} className="h-full w-full overflow-hidden" />;
}
