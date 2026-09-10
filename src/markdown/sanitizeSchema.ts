import { defaultSchema } from "rehype-sanitize";
import type { Schema } from "hast-util-sanitize";

/**
 * Markdown files may come from untrusted sources, so the rendered HTML is
 * sanitized: no scripts, no inline event handlers, no raw HTML pass-through
 * beyond a safe subset. This extends the default schema only to allow the
 * class names rehype-highlight and GFM task lists need to render correctly.
 */
export const previewSanitizeSchema: Schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ["className", /^(language-|hljs)/]],
    span: [...(defaultSchema.attributes?.span ?? []), ["className", /^hljs/]],
    li: [...(defaultSchema.attributes?.li ?? []), "className"],
    ul: [...(defaultSchema.attributes?.ul ?? []), "className"],
    input: [...(defaultSchema.attributes?.input ?? []), "type", "checked", "disabled"],
  },
  tagNames: [...(defaultSchema.tagNames ?? []), "input"],
};
