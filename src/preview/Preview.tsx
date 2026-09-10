import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import { openUrl } from "@tauri-apps/plugin-opener";
import { convertFileSrc } from "@tauri-apps/api/core";
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
  if (!src) return undefined;

  const trimmed = src.trim();

  // Block dangerous pseudo-protocols (XSS / local file execution)
  if (/^(javascript|vbscript|file):/i.test(trimmed)) {
    return undefined;
  }

  // Allow secure external images over HTTP/HTTPS
  if (isExternalHref(trimmed)) {
    return trimmed;
  }

  // Allow standard base64 image data URIs only (prevent SVG with embedded scripts or arbitrary data)
  if (/^data:image\/(png|jpeg|jpg|gif|webp|bmp);base64,/i.test(trimmed)) {
    return trimmed;
  }

  // Block Windows UNC / SMB paths (\\attacker\share or //attacker/share) to prevent NTLM hash leaks
  if (/^[/\\]{2}/.test(trimmed)) {
    return undefined;
  }

  // If no base path is known (e.g. unsaved untitled document), relative local file cannot be resolved safely
  if (!basePath) return undefined;

  // Block directory traversal (both plain and URL-encoded)
  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    return undefined;
  }
  if (decoded.includes("..") || trimmed.includes("..")) {
    return undefined;
  }

  // Normalize path separators and combine with document basePath
  const separator = basePath.includes("\\") ? "\\" : "/";
  const cleanBase = basePath.endsWith(separator) ? basePath : basePath + separator;
  const cleanSrc = trimmed.replace(/^\.[/\\]/, "");
  const fullPath = cleanBase + cleanSrc;

  // Use Tauri's official convertFileSrc for asset protocol mapping
  try {
    return convertFileSrc(fullPath);
  } catch {
    return `asset://localhost/${encodeURIComponent(fullPath).replace(/%2F/g, "/").replace(/%5C/g, "/")}`;
  }
}

function handleLinkClick(e: React.MouseEvent<HTMLAnchorElement>, href: string | undefined) {
  if (!href) return;
  e.preventDefault();
  if (isExternalHref(href)) {
    void openUrl(href);
  }
}

export const Preview = memo(function Preview({ content, basePath }: PreviewProps) {
  // rehypeHighlight runs FIRST to tokenize code, then rehypeSanitize validates all nodes
  const rehypePlugins = useMemo(
    () => [rehypeHighlight, [rehypeSanitize, previewSanitizeSchema] as const] as const,
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
          img: ({ src, alt, ...props }) => {
            const resolved = resolveImagePath(src, basePath);
            return resolved ? <img src={resolved} alt={alt} {...props} /> : null;
          },
          pre: CodeBlock,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
