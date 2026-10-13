import { useState, type HTMLAttributes, type ReactElement, isValidElement } from "react";
import { Check, Copy } from "lucide-react";

function extractLanguage(children: ReactElement | undefined): string | null {
  const className = (children?.props as { className?: string } | undefined)?.className ?? "";
  const match = /language-(\w+)/.exec(className);
  return match ? match[1] : null;
}

function extractText(node: unknown): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) {
    const props = node.props as { children?: unknown };
    return extractText(props.children);
  }
  return "";
}

export function CodeBlock({ children, ...props }: HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const codeChild = isValidElement(children) ? (children as ReactElement) : undefined;
  const language = extractLanguage(codeChild);
  const text = extractText(children);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
      setCopyFailed(true);
    }
  }

  return (
    <div className="group relative">
      {language && (
        <span className="absolute right-11 top-2 text-[11px] font-medium uppercase tracking-wide text-[var(--text-tertiary)] select-none">
          {language}
        </span>
      )}
      <button
        type="button"
        onClick={handleCopy}
        title={copyFailed ? "Clipboard unavailable" : copied ? "Copied" : "Copy code"}
        aria-label={copyFailed ? "Copy failed" : "Copy code"}
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded text-[var(--text-tertiary)] opacity-0 transition-opacity hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] group-hover:opacity-100"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <pre {...props}>{children}</pre>
    </div>
  );
}
