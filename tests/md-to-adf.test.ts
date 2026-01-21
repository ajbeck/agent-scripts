/**
 * Tests for md-to-adf converter
 *
 * Validates output against ADF JSON schema using Ajv
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { markdownToAdf, type AdfDocument } from "../scripts/lib/md-to-adf";
import adfSchema from "../scripts/lib/acli/adf-schema.json";

// Initialize Ajv with draft-04 support
const ajv = new Ajv({
  allErrors: true,
  strict: false,
  validateSchema: false,
});
addFormats(ajv);

const validate = ajv.compile(adfSchema);

function assertValidAdf(adf: AdfDocument, markdown: string): void {
  const valid = validate(adf);
  if (!valid) {
    console.error("Validation errors for markdown:", markdown);
    console.error("ADF output:", JSON.stringify(adf, null, 2));
    console.error("Errors:", validate.errors);
  }
  assert.ok(valid, `ADF validation failed: ${JSON.stringify(validate.errors)}`);
}

describe("markdownToAdf", () => {
  describe("basic structure", () => {
    it("produces valid ADF for empty string", () => {
      const adf = markdownToAdf("");
      assert.strictEqual(adf.type, "doc");
      assert.strictEqual(adf.version, 1);
      assertValidAdf(adf, "");
    });

    it("produces valid ADF for simple paragraph", () => {
      const markdown = "Hello, world!";
      const adf = markdownToAdf(markdown);
      assert.strictEqual(adf.type, "doc");
      assertValidAdf(adf, markdown);
    });
  });

  describe("headings", () => {
    it("converts h1 heading", () => {
      const markdown = "# Heading 1";
      const adf = markdownToAdf(markdown);
      assertValidAdf(adf, markdown);

      const heading = adf.content.find((n) => n.type === "heading");
      assert.ok(heading, "Should have heading node");
      assert.strictEqual(heading.attrs?.level, 1);
    });

    it("converts h2 through h6 headings", () => {
      for (let level = 2; level <= 6; level++) {
        const markdown = `${"#".repeat(level)} Heading ${level}`;
        const adf = markdownToAdf(markdown);
        assertValidAdf(adf, markdown);

        const heading = adf.content.find((n) => n.type === "heading");
        assert.ok(heading, `Should have heading level ${level}`);
        assert.strictEqual(heading.attrs?.level, level);
      }
    });
  });

  describe("text marks", () => {
    it("converts bold text", () => {
      const markdown = "This is **bold** text.";
      const adf = markdownToAdf(markdown);
      assertValidAdf(adf, markdown);

      const paragraph = adf.content.find((n) => n.type === "paragraph");
      const boldText = paragraph?.content?.find((n) =>
        n.marks?.some((m) => m.type === "strong")
      );
      assert.ok(boldText, "Should have bold marked text");
    });

    it("converts italic text", () => {
      const markdown = "This is *italic* text.";
      const adf = markdownToAdf(markdown);
      assertValidAdf(adf, markdown);

      const paragraph = adf.content.find((n) => n.type === "paragraph");
      const italicText = paragraph?.content?.find((n) =>
        n.marks?.some((m) => m.type === "em")
      );
      assert.ok(italicText, "Should have italic marked text");
    });

    it("converts inline code", () => {
      const markdown = "Use `const x = 1` for constants.";
      const adf = markdownToAdf(markdown);
      assertValidAdf(adf, markdown);

      const paragraph = adf.content.find((n) => n.type === "paragraph");
      const codeText = paragraph?.content?.find((n) =>
        n.marks?.some((m) => m.type === "code")
      );
      assert.ok(codeText, "Should have code marked text");
    });

    it("converts strikethrough text", () => {
      const markdown = "This is ~~deleted~~ text.";
      const adf = markdownToAdf(markdown);
      assertValidAdf(adf, markdown);
    });
  });

  describe("links", () => {
    it("converts markdown links", () => {
      const markdown = "Visit [Anthropic](https://anthropic.com) for more.";
      const adf = markdownToAdf(markdown);
      assertValidAdf(adf, markdown);

      const paragraph = adf.content.find((n) => n.type === "paragraph");
      const linkText = paragraph?.content?.find((n) =>
        n.marks?.some((m) => m.type === "link")
      );
      assert.ok(linkText, "Should have link marked text");

      const linkMark = linkText?.marks?.find((m) => m.type === "link");
      assert.strictEqual(linkMark?.attrs?.href, "https://anthropic.com");
    });
  });

  describe("lists", () => {
    it("converts bullet lists", () => {
      const markdown = "- Item 1\n- Item 2\n- Item 3";
      const adf = markdownToAdf(markdown);
      assertValidAdf(adf, markdown);

      const list = adf.content.find((n) => n.type === "bulletList");
      assert.ok(list, "Should have bulletList node");
      assert.strictEqual(list.content?.length, 3);
    });

    it("converts ordered lists", () => {
      const markdown = "1. First\n2. Second\n3. Third";
      const adf = markdownToAdf(markdown);
      assertValidAdf(adf, markdown);

      const list = adf.content.find((n) => n.type === "orderedList");
      assert.ok(list, "Should have orderedList node");
      assert.strictEqual(list.content?.length, 3);
    });

    it("converts nested lists", () => {
      const markdown = "- Parent\n  - Child 1\n  - Child 2";
      const adf = markdownToAdf(markdown);
      assertValidAdf(adf, markdown);
    });
  });

  describe("code blocks", () => {
    it("converts fenced code blocks", () => {
      const markdown = "```javascript\nconst x = 1;\n```";
      const adf = markdownToAdf(markdown);
      assertValidAdf(adf, markdown);

      const codeBlock = adf.content.find((n) => n.type === "codeBlock");
      assert.ok(codeBlock, "Should have codeBlock node");
      assert.strictEqual(codeBlock.attrs?.language, "javascript");
    });

    it("converts code blocks without language", () => {
      const markdown = "```\nplain code\n```";
      const adf = markdownToAdf(markdown);
      assertValidAdf(adf, markdown);

      const codeBlock = adf.content.find((n) => n.type === "codeBlock");
      assert.ok(codeBlock, "Should have codeBlock node");
    });
  });

  describe("blockquotes", () => {
    it("converts blockquotes", () => {
      const markdown = "> This is a quote.";
      const adf = markdownToAdf(markdown);
      assertValidAdf(adf, markdown);

      const blockquote = adf.content.find((n) => n.type === "blockquote");
      assert.ok(blockquote, "Should have blockquote node");
    });

    it("converts multi-line blockquotes", () => {
      const markdown = "> Line 1\n> Line 2\n> Line 3";
      const adf = markdownToAdf(markdown);
      assertValidAdf(adf, markdown);
    });
  });

  describe("horizontal rule", () => {
    it("converts horizontal rules", () => {
      const markdown = "Above\n\n---\n\nBelow";
      const adf = markdownToAdf(markdown);
      assertValidAdf(adf, markdown);

      const rule = adf.content.find((n) => n.type === "rule");
      assert.ok(rule, "Should have rule node");
    });
  });

  describe("tables", () => {
    it("converts simple markdown table", () => {
      const markdown = `| Header 1 | Header 2 |
| --- | --- |
| Cell 1 | Cell 2 |`;

      const adf = markdownToAdf(markdown);
      assertValidAdf(adf, markdown);

      const table = adf.content.find((n) => n.type === "table");
      assert.ok(table, "Should have table node");
      assert.ok(table.content, "Table should have content");
      assert.ok(table.content.length >= 2, "Table should have at least 2 rows");
    });

    it("converts table with multiple columns", () => {
      const markdown = `| A | B | C | D |
| --- | --- | --- | --- |
| 1 | 2 | 3 | 4 |
| 5 | 6 | 7 | 8 |`;

      const adf = markdownToAdf(markdown);
      assertValidAdf(adf, markdown);

      const table = adf.content.find((n) => n.type === "table");
      assert.ok(table, "Should have table node");

      const rows = table.content;
      assert.strictEqual(rows?.length, 3, "Should have 3 rows");
    });

    it("converts table with formatted content", () => {
      const markdown = `| Feature | Status |
| --- | --- |
| **Bold** | *Italic* |
| \`code\` | [link](https://example.com) |`;

      const adf = markdownToAdf(markdown);
      assertValidAdf(adf, markdown);

      const table = adf.content.find((n) => n.type === "table");
      assert.ok(table, "Should have table node");
    });
  });

  describe("complex documents", () => {
    it("handles mixed content", () => {
      const markdown = `# Document Title

This is a paragraph with **bold** and *italic* text.

## Section 1

- Item one
- Item two
  - Nested item

## Section 2

| Col A | Col B |
| --- | --- |
| Val 1 | Val 2 |

> A blockquote for emphasis.

\`\`\`typescript
const foo = "bar";
\`\`\`
`;

      const adf = markdownToAdf(markdown);
      assertValidAdf(adf, markdown);

      // Check for presence of various node types
      const nodeTypes = adf.content.map((n) => n.type);
      assert.ok(nodeTypes.includes("heading"), "Should have heading");
      assert.ok(nodeTypes.includes("paragraph"), "Should have paragraph");
      assert.ok(nodeTypes.includes("bulletList"), "Should have bulletList");
      assert.ok(nodeTypes.includes("table"), "Should have table");
      assert.ok(nodeTypes.includes("blockquote"), "Should have blockquote");
      assert.ok(nodeTypes.includes("codeBlock"), "Should have codeBlock");
    });
  });
});
