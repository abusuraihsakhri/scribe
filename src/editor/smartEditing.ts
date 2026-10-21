import { EditorSelection } from "@codemirror/state";
import { indentMore, indentLess } from "@codemirror/commands";
import { keymap, type KeyBinding, type Command } from "@codemirror/view";

const BULLET_RE = /^(\s*)([-*+])(\s+)(\[[ xX]\]\s+)?/;
const ORDERED_RE = /^(\s*)(\d+)([.)])(\s+)/;
const QUOTE_RE = /^(\s*)(>+)(\s?)/;

/** Continues lists, checklists, and blockquotes when Enter is pressed,
 *  and terminates them (removing the empty marker) when the item is empty. */
const continueListOnEnter: Command = (view) => {
  const { state } = view;
  let handled = false;

  const changes = state.changeByRange((range) => {
    const line = state.doc.lineAt(range.from);
    const text = line.text;

    const bulletMatch = BULLET_RE.exec(text);
    const orderedMatch = !bulletMatch ? ORDERED_RE.exec(text) : null;
    const quoteMatch = !bulletMatch && !orderedMatch ? QUOTE_RE.exec(text) : null;

    if (!bulletMatch && !orderedMatch && !quoteMatch) {
      return { range, changes: [] };
    }

    handled = true;
    const match = (bulletMatch ?? orderedMatch ?? quoteMatch)!;
    const isEmpty = line.text.slice(match[0].length).trim().length === 0;

    if (isEmpty) {
      // Empty list item / quote: remove the marker instead of continuing it.
      const from = line.from + match[1].length;
      return {
        range: EditorSelection.cursor(from),
        changes: { from, to: line.to, insert: "" },
      };
    }

    let insertion = "\n";
    if (bulletMatch) {
      const [, indent, bullet, spacing, checkbox] = bulletMatch;
      insertion += indent + bullet + spacing + (checkbox ? "[ ] " : "");
    } else if (orderedMatch) {
      const [, indent, num, delim, spacing] = orderedMatch;
      insertion += indent + (parseInt(num, 10) + 1) + delim + spacing;
    } else if (quoteMatch) {
      const [, indent, marks, spacing] = quoteMatch;
      insertion += indent + marks + spacing;
    }

    return {
      range: EditorSelection.cursor(range.from + insertion.length),
      changes: { from: range.from, to: range.to, insert: insertion },
    };
  });

  if (!handled) return false;
  view.dispatch(changes, { scrollIntoView: true, userEvent: "input" });
  return true;
};

export const smartListBindings: KeyBinding[] = [
  { key: "Enter", run: continueListOnEnter },
  { key: "Tab", run: indentMore },
  { key: "Shift-Tab", run: indentLess },
];

export function smartEditingKeymap() {
  return keymap.of(smartListBindings);
}
