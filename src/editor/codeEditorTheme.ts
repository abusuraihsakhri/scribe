import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

/** Editor chrome (gutters, selection, cursor) driven by the app's CSS variables,
 *  so it repaints automatically when the theme toggles, with no editor recreation needed. */
export const editorAppearance = EditorView.theme({
  "&": {
    color: "var(--editor-fg)",
    backgroundColor: "var(--editor-bg)",
    height: "100%",
    fontSize: "14.5px",
  },
  ".cm-content": {
    fontFamily: "var(--font-mono)",
    caretColor: "var(--editor-cursor)",
    padding: "1rem 0",
    lineHeight: "1.65",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--editor-cursor)",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "var(--editor-selection)",
  },
  ".cm-activeLine": {
    backgroundColor: "var(--editor-line-active)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--editor-line-active)",
    color: "var(--text-primary)",
  },
  ".cm-gutters": {
    backgroundColor: "var(--editor-bg)",
    color: "var(--editor-gutter-fg)",
    border: "none",
    paddingRight: "0.5rem",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    fontFamily: "var(--font-mono)",
    fontSize: "12.5px",
  },
  ".cm-matchingBracket, .cm-nonmatchingBracket": {
    backgroundColor: "var(--accent-soft)",
    outline: "1px solid var(--accent)",
  },
  "&.cm-editor.cm-focused": {
    outline: "none",
  },
  ".cm-scroller": {
    overflow: "auto",
  },
  ".cm-searchMatch": {
    backgroundColor: "var(--accent-soft)",
    outline: "1px solid var(--accent)",
  },
  ".cm-searchMatch-selected": {
    backgroundColor: "var(--accent)",
    color: "var(--text-on-accent)",
  },
}, { dark: false });

/** Semantic Markdown syntax colors, mapped to CSS variables so both themes share one style. */
export const markdownHighlightStyle = HighlightStyle.define([
  { tag: tags.heading, color: "var(--syntax-heading)", fontWeight: "600" },
  { tag: tags.strong, color: "var(--syntax-strong)", fontWeight: "700" },
  { tag: tags.emphasis, color: "var(--syntax-emphasis)", fontStyle: "italic" },
  { tag: tags.strikethrough, color: "var(--text-tertiary)", textDecoration: "line-through" },
  { tag: tags.link, color: "var(--syntax-link)", textDecoration: "underline" },
  { tag: tags.url, color: "var(--syntax-link)" },
  { tag: tags.monospace, color: "var(--syntax-code)", fontFamily: "var(--font-mono)" },
  { tag: tags.quote, color: "var(--syntax-quote)", fontStyle: "italic" },
  { tag: tags.processingInstruction, color: "var(--syntax-punctuation)" },
  { tag: tags.contentSeparator, color: "var(--syntax-punctuation)" },
  { tag: tags.list, color: "var(--syntax-punctuation)" },
  { tag: tags.meta, color: "var(--text-tertiary)" },
]);

export function markdownTheme() {
  return [editorAppearance, syntaxHighlighting(markdownHighlightStyle)];
}
