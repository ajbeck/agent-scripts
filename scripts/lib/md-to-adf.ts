/**
 * Markdown to ADF (Atlassian Document Format) converter
 */

import { createSchema } from "@atlaskit/adf-schema";
import { JSONTransformer } from "@atlaskit/editor-json-transformer";
import { MarkdownTransformer } from "@atlaskit/editor-markdown-transformer";

export interface AdfMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface AdfNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: AdfNode[];
  marks?: AdfMark[];
  text?: string;
}

export interface AdfDocument {
  version: 1;
  type: "doc";
  content: AdfNode[];
}

// Create schema with comprehensive nodes/marks for markdown support
const schema = createSchema({
  nodes: [
    "doc",
    "paragraph",
    "text",
    "bulletList",
    "orderedList",
    "listItem",
    "heading",
    "blockquote",
    "codeBlock",
    "hardBreak",
    "rule",
    "table",
    "tableRow",
    "tableCell",
    "tableHeader",
  ],
  marks: ["strong", "em", "code", "link", "strike"],
});

const jsonTransformer = new JSONTransformer();
const markdownTransformer = new MarkdownTransformer(schema);

/**
 * Convert markdown string to ADF document
 */
export function markdownToAdf(markdown: string): AdfDocument {
  const pmNode = markdownTransformer.parse(markdown);
  return jsonTransformer.encode(pmNode) as AdfDocument;
}

/**
 * Convert markdown string to ADF JSON string
 */
export function markdownToAdfString(markdown: string): string {
  return JSON.stringify(markdownToAdf(markdown));
}
