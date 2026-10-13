import type { EditorView } from "@codemirror/view";
import { EditorSelection } from "@codemirror/state";

export interface FormatResult {
  text: string;
  from: number;
  to: number;
}

function wrapSelection(text: string, selFrom: number, selTo: number, wrapper: string): FormatResult {
  const before = text.slice(0, selFrom);
  const selected = text.slice(selFrom, selTo);
  const after = text.slice(selTo);

  // If already wrapped, unwrap
  if (before.endsWith(wrapper) && after.startsWith(wrapper)) {
    return {
      text: before.slice(0, -wrapper.length) + selected + after.slice(wrapper.length),
      from: selFrom - wrapper.length,
      to: selTo - wrapper.length,
    };
  }

  // If selection is empty, insert wrapper placeholders
  if (selFrom === selTo) {
    const placeholder = "text";
    return {
      text: before + wrapper + placeholder + wrapper + after,
      from: selFrom + wrapper.length,
      to: selFrom + wrapper.length + placeholder.length,
    };
  }

  return {
    text: before + wrapper + selected + wrapper + after,
    from: selFrom + wrapper.length,
    to: selTo + wrapper.length,
  };
}

function toggleLinePrefix(text: string, selFrom: number, selTo: number, prefix: string): FormatResult {
  const lines = text.split("\n");
  let charCount = 0;
  let startLine = 0;
  let endLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineEnd = charCount + lines[i].length;
    if (charCount <= selFrom && selFrom <= lineEnd) startLine = i;
    if (charCount <= selTo && selTo <= lineEnd) endLine = i;
    charCount = lineEnd + 1;
  }

  const targetLines = lines.slice(startLine, endLine + 1);
  const allHavePrefix = targetLines.every((l) => l.startsWith(prefix));
  let changedCount = 0;

  for (let i = startLine; i <= endLine; i++) {
    if (allHavePrefix) {
      lines[i] = lines[i].slice(prefix.length);
      changedCount++;
    } else if (!lines[i].startsWith(prefix)) {
      lines[i] = prefix + lines[i];
      changedCount++;
    }
  }

  const newText = lines.join("\n");
  const diff = allHavePrefix ? -prefix.length : prefix.length;
  return {
    text: newText,
    from: selFrom + (startLine === endLine ? diff : (lines[startLine].startsWith(prefix) !== targetLines[0].startsWith(prefix) ? diff : 0)),
    to: selTo + diff * changedCount,
  };
}

/** Inserts a Markdown construct, replacing the selected span rather than duplicating it. */
export function insertAtSelection(text: string, from: number, to: number, before: string, after: string, placeholder: string): FormatResult {
  const pre = text.slice(0, from);
  const post = text.slice(to);
  return {
    text: pre + before + placeholder + after + post,
    from: from + before.length,
    to: from + before.length + placeholder.length,
  };
}

function insertBlock(text: string, cursor: number, block: string): FormatResult {
  const pre = text.slice(0, cursor);
  const post = text.slice(cursor);
  const needsNewlineBefore = pre.length > 0 && !pre.endsWith("\n\n");
  const needsNewlineAfter = post.length > 0 && !post.startsWith("\n");
  const prefix = needsNewlineBefore ? (pre.endsWith("\n") ? "\n" : "\n\n") : "";
  const suffix = needsNewlineAfter ? "\n" : "";
  return {
    text: pre + prefix + block + suffix + post,
    from: cursor + prefix.length,
    to: cursor + prefix.length + block.length,
  };
}

export type FormatAction =
  | "bold"
  | "italic"
  | "strikethrough"
  | "inlineCode"
  | "heading"
  | "link"
  | "image"
  | "quote"
  | "bulletList"
  | "orderedList"
  | "checklist"
  | "codeBlock"
  | "table"
  | "horizontalRule";

export function applyFormat(view: EditorView, action: FormatAction) {
  const { state } = view;
  const range = state.selection.main;
  const text = state.doc.toString();
  const selFrom = range.from;
  const selTo = range.to;
  const selected = text.slice(selFrom, selTo);

  let result: FormatResult;

  switch (action) {
    case "bold":
      result = wrapSelection(text, selFrom, selTo, "**");
      break;
    case "italic":
      result = wrapSelection(text, selFrom, selTo, "*");
      break;
    case "strikethrough":
      result = wrapSelection(text, selFrom, selTo, "~~");
      break;
    case "inlineCode":
      result = wrapSelection(text, selFrom, selTo, "`");
      break;
    case "heading": {
      const lineStart = text.lastIndexOf("\n", selFrom - 1) + 1;
      const line = text.slice(lineStart, text.indexOf("\n", selFrom) === -1 ? text.length : text.indexOf("\n", selFrom));
      const headingMatch = /^(#{1,6})\s/.exec(line);
      if (headingMatch) {
        const level = headingMatch[1].length;
        if (level >= 6) {
          // Remove heading
          result = { text: text.slice(0, lineStart) + line.slice(level + 1) + text.slice(lineStart + line.length), from: selFrom - level - 1, to: selTo - level - 1 };
        } else {
          // Increase level
          result = { text: text.slice(0, lineStart) + "#" + line + text.slice(lineStart + line.length), from: selFrom + 1, to: selTo + 1 };
        }
      } else {
        result = { text: text.slice(0, lineStart) + "## " + line + text.slice(lineStart + line.length), from: selFrom + 3, to: selTo + 3 };
      }
      break;
    }
    case "link":
      result = insertAtSelection(text, selFrom, selTo, "[", "](url)", selected || "link text");
      break;
    case "image":
      result = insertAtSelection(text, selFrom, selTo, "![", "](image-url)", selected || "alt text");
      break;
    case "quote":
      result = toggleLinePrefix(text, selFrom, selTo, "> ");
      break;
    case "bulletList":
      result = toggleLinePrefix(text, selFrom, selTo, "- ");
      break;
    case "orderedList": {
      const lines = text.split("\n");
      let charCount = 0;
      let startLine = 0;
      let endLine = 0;
      for (let i = 0; i < lines.length; i++) {
        const lineEnd = charCount + lines[i].length;
        if (charCount <= selFrom && selFrom <= lineEnd) startLine = i;
        if (charCount <= selTo && selTo <= lineEnd) endLine = i;
        charCount = lineEnd + 1;
      }
      const allOrdered = lines.slice(startLine, endLine + 1).every((l) => /^\d+\.\s/.test(l));
      if (allOrdered) {
        for (let i = startLine; i <= endLine; i++) {
          lines[i] = lines[i].replace(/^\d+\.\s/, "");
        }
      } else {
        for (let i = startLine; i <= endLine; i++) {
          if (!/^\d+\.\s/.test(lines[i])) {
            lines[i] = `${i - startLine + 1}. ${lines[i]}`;
          }
        }
      }
      result = { text: lines.join("\n"), from: selFrom, to: selTo };
      break;
    }
    case "checklist":
      result = toggleLinePrefix(text, selFrom, selTo, "- [ ] ");
      break;
    case "codeBlock":
      result = insertBlock(text, selFrom, "```\n" + (selected || "code") + "\n```");
      break;
    case "table":
      result = insertBlock(text, selFrom, "| Header | Header |\n|--------|--------|\n| Cell   | Cell   |");
      break;
    case "horizontalRule":
      result = insertBlock(text, selFrom, "---");
      break;
    default:
      return;
  }

  // Prefix removal can move positions before the original document start.
  const clamp = (position: number) => Math.max(0, Math.min(position, result.text.length));
  view.dispatch({
    changes: { from: 0, to: text.length, insert: result.text },
    selection: EditorSelection.range(clamp(result.from), clamp(result.to)),
    scrollIntoView: true,
  });
  view.focus();
}
