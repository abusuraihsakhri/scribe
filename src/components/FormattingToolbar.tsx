import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Link,
  ImageIcon,
  Quote,
  List,
  ListOrdered,
  ListChecks,
  Braces,
  Table,
  Minus,
} from "lucide-react";
import type { EditorView } from "@codemirror/view";
import { applyFormat, type FormatAction } from "../editor/formatting";

interface FormattingToolbarProps {
  editorRef: React.MutableRefObject<EditorView | null>;
}

interface FormatButton {
  action: FormatAction;
  icon: React.ReactNode;
  title: string;
  shortcut?: string;
}

const FORMAT_BUTTONS: FormatButton[] = [
  { action: "heading", icon: <Heading1 size={15} />, title: "Heading" },
  { action: "bold", icon: <Bold size={15} />, title: "Bold", shortcut: "Ctrl+B" },
  { action: "italic", icon: <Italic size={15} />, title: "Italic", shortcut: "Ctrl+I" },
  { action: "strikethrough", icon: <Strikethrough size={15} />, title: "Strikethrough" },
  { action: "inlineCode", icon: <Code size={15} />, title: "Inline Code" },
  { action: "codeBlock", icon: <Braces size={15} />, title: "Code Block" },
  { action: "link", icon: <Link size={15} />, title: "Link", shortcut: "Ctrl+K" },
  { action: "image", icon: <ImageIcon size={15} />, title: "Image" },
  { action: "quote", icon: <Quote size={15} />, title: "Blockquote" },
  { action: "bulletList", icon: <List size={15} />, title: "Bullet List" },
  { action: "orderedList", icon: <ListOrdered size={15} />, title: "Numbered List" },
  { action: "checklist", icon: <ListChecks size={15} />, title: "Checklist" },
  { action: "table", icon: <Table size={15} />, title: "Table" },
  { action: "horizontalRule", icon: <Minus size={15} />, title: "Horizontal Rule" },
];

export function FormattingToolbar({ editorRef }: FormattingToolbarProps) {
  function handleClick(action: FormatAction) {
    const view = editorRef.current;
    if (!view) return;
    applyFormat(view, action);
  }

  return (
    <div className="flex h-9 shrink-0 items-center gap-0.5 overflow-x-auto border-b border-[var(--border)] bg-[var(--bg-surface)] px-2">
      {FORMAT_BUTTONS.map((btn) => (
        <button
          key={btn.action}
          type="button"
          title={btn.shortcut ? `${btn.title} (${btn.shortcut})` : btn.title}
          aria-label={btn.title}
          onClick={() => handleClick(btn.action)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
}
