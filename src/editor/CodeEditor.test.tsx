// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { EditorView } from "@codemirror/view";
import { undo } from "@codemirror/commands";
import { CodeEditor, retainEditorStates } from "./CodeEditor";

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

// Mimics App: one content string per document, written back through onChange.
const docs: Record<string, string> = {};
const editorRef: React.MutableRefObject<EditorView | null> = { current: null };
let root: Root | null = null;
let host: HTMLDivElement;

function show(docId: string) {
  const element = createElement(CodeEditor, {
    docId,
    value: docs[docId],
    onChange: (value: string) => { docs[docId] = value; },
    editorRef,
  });
  act(() => {
    if (!root) {
      host = document.createElement("div");
      document.body.appendChild(host);
      root = createRoot(host);
    }
    root.render(element);
  });
}

function unmount() {
  act(() => root?.unmount());
  root = null;
}

function type(text: string) {
  const view = editorRef.current!;
  act(() => view.dispatch({ changes: { from: view.state.doc.length, insert: text } }));
}

function pressUndo() {
  act(() => { undo(editorRef.current!); });
}

afterEach(() => {
  unmount();
  retainEditorStates(new Set());
});

describe("CodeEditor tabs", () => {
  it("undo after switching tabs does not bring in the other document's text", () => {
    docs.a = "text A";
    docs.b = "text B";
    show("a");
    type(" edited");
    show("b");

    pressUndo();

    expect(docs.b).toBe("text B");
    expect(editorRef.current!.state.doc.toString()).toBe("text B");
  });

  it("keeps each document's own undo history across switches", () => {
    docs.a = "text A";
    docs.b = "text B";
    show("a");
    type(" edited");
    show("b");
    show("a");

    pressUndo();

    expect(docs.a).toBe("text A");
  });

  it("restored history writes to the current callbacks after a remount", () => {
    docs.a = "text A";
    show("a");
    type(" edited");
    unmount(); // e.g. switching between editor and split view

    show("a");
    pressUndo();

    expect(docs.a).toBe("text A");
  });
});
