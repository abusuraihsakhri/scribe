import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import { openUrl } from "@tauri-apps/plugin-opener";
import { previewSanitizeSchema } from "../markdown/sanitizeSchema";
import { CodeBlock } from "./CodeBlock";

interface PreviewProps {
  content: string;
  basePath?: string;
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function resolveImagePath(src: string | undefined, basePath?: string): string | undefined {
  if (!src) return src;
  if (isExternalHref(src) || src.startsWith("data:")) return src;
  if (!basePath) return src;
  // Block path traversal
  if (src.includes("..")) return src;
  const separator = basePath.includes("\\") ? "\\" : "/";
  const cleanBase = basePath.endsWith(separator) ? basePath : basePath + separator;
  const cleanSrc = src.replace(/^\.[/\\]/, "");
  return `asset://localhost/${encodeURIComponent(cleanBase + cleanSrc).replace(/%2F/g, "/").replace(/%5C/g, "/")}`;
}

function handleLinkClick(e: React.MouseEvent<HTMLAnchorElement>, href: string | undefined) {
  if (!href) return;
  e.preventDefault();
  if (isExternalHref(href)) {
    void openUrl(href);
  }
}

export const Preview = memo(function Preview({ content, basePath }: PreviewProps) {
  const rehypePlugins = useMemo(
    () => [[rehypeSanitize, previewSanitizeSchema] as const, rehypeHighlight] as const,
    [],
  );

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={rehypePlugins as unknown as never[]}
        components={{
          a: ({ href, children, ...props }) => (
            <a href={href} onClick={(e) => handleLinkClick(e, href)} {...props}>
              {children}
            </a>
          ),
          img: ({ src, alt, ...props }) => (
            <img src={resolveImagePath(src, basePath)} alt={alt} {...props} />
          ),
          pre: CodeBlock,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
