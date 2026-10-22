import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { openUrl } from "@tauri-apps/plugin-opener";
import { convertFileSrc } from "@tauri-apps/api/core";
import { previewSanitizeSchema } from "../markdown/sanitizeSchema";
import { CodeBlock } from "./CodeBlock";
import { isAbsolutePath, resolveRelativePath } from "../utils/paths";

interface PreviewProps {
  content: string;
  basePath?: string;
  /** Opens a local Markdown file that a link points to. */
  onOpenFile?: (path: string) => void;
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

const MARKDOWN_FILE = /\.(md|markdown|mdown|mkd)$/i;

/** Resolves a link or image path (URL-encoded, relative to the document or absolute) to a file path. */
function resolveLocalPath(src: string, basePath?: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(src);
  } catch {
    return null;
  }
  if (isAbsolutePath(decoded)) return decoded;
  // An unsaved document has no folder to resolve against
  if (!basePath) return null;
  return resolveRelativePath(basePath, decoded);
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

  // Which files may actually load is enforced by the assetProtocol scope in tauri.conf.json
  // (image extensions only, sensitive folders denied), so ".." is allowed here.
  const fullPath = resolveLocalPath(trimmed, basePath);
  return fullPath ? convertFileSrc(fullPath) : undefined;
}

/**
 * A local image requested while the app is still starting up occasionally fails on Windows, and the
 * webview then caches the failure for that URL. One retry with a cache-busting query (ignored by the
 * asset protocol) recovers it.
 */
function retryLocalImageOnce(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.dataset.retried || !/^https?:\/\/asset\.localhost\/|^asset:/.test(img.src)) return;
  img.dataset.retried = "true";
  img.src = `${img.src}?retry=1`;
}

function scrollToFragment(fragment: string) {
  let id: string;
  try {
    id = decodeURIComponent(fragment);
  } catch {
    return;
  }
  // rehype-sanitize prefixes ids with "user-content-" (as GitHub does); footnote links already include it.
  const target = document.getElementById(id) ?? document.getElementById(`user-content-${id}`);
  target?.scrollIntoView({ block: "start" });
}

function handleLinkClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string | undefined,
  basePath: string | undefined,
  onOpenFile: ((path: string) => void) | undefined,
) {
  if (!href) return;
  e.preventDefault();
  if (isExternalHref(href) || /^mailto:/i.test(href)) {
    void openUrl(href);
    return;
  }
  if (href.startsWith("#")) {
    scrollToFragment(href.slice(1));
    return;
  }
  const [filePart] = href.split("#");
  if (!MARKDOWN_FILE.test(filePart)) return;
  const path = resolveLocalPath(filePart, basePath);
  if (path) onOpenFile?.(path);
}

export const Preview = memo(function Preview({ content, basePath, onOpenFile }: PreviewProps) {
  // rehypeHighlight tokenizes code and rehypeSlug adds heading ids, then rehypeSanitize validates all nodes
  const rehypePlugins = useMemo(
    () => [rehypeHighlight, rehypeSlug, [rehypeSanitize, previewSanitizeSchema] as const] as const,
    [],
  );

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={rehypePlugins as unknown as never[]}
        components={{
          // `node` is react-markdown's hast node; keep it off the DOM element
          a: ({ node: _node, href, children, ...props }) => (
            <a href={href} onClick={(e) => handleLinkClick(e, href, basePath, onOpenFile)} {...props}>
              {children}
            </a>
          ),
          img: ({ node: _node, src, alt, ...props }) => {
            const resolved = resolveImagePath(src, basePath);
            return resolved ? <img src={resolved} alt={alt} onError={retryLocalImageOnce} {...props} /> : null;
          },
          pre: CodeBlock,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
