/**
 * Tests for acli workitem functions
 *
 * Tests the JSON payload structure without making actual API calls.
 * For integration tests with real Jira, use DUCK-135 as test workitem.
 */

import { describe, it, mock, beforeEach } from "bun:test";
import assert from "node:assert";
import { markdownToAdf } from "../scripts/lib/md-to-adf";

// Mock the withTempJson to capture payloads without writing files
let capturedPayload: unknown = null;
let capturedCommand: string[] = [];

mock.module("../scripts/lib/acli/utils", () => ({
  withTempJson: async <T>(data: unknown, fn: (path: string) => Promise<T>) => {
    capturedPayload = data;
    // Don't actually call fn, just return a mock result
    return { success: true, data: { mocked: true } } as T;
  },
}));

// Mock jiraExec to capture commands
mock.module("../scripts/lib/acli/base", () => ({
  jiraExec: async <T>(subcommand: string, args: string[] = []) => {
    capturedCommand = [subcommand, ...args];
    return { success: true, data: { mocked: true } } as T;
  },
}));

// Import after mocking
const { create, edit, search, view, transition } = await import(
  "../scripts/lib/acli/workitem"
);

describe("acli.workitem.create", () => {
  beforeEach(() => {
    capturedPayload = null;
    capturedCommand = [];
  });

  it("builds correct payload with required fields", async () => {
    await create({
      project: "TEAM",
      type: "Task",
      summary: "Test task",
    });

    const payload = capturedPayload as Record<string, unknown>;
    assert.strictEqual(payload.projectKey, "TEAM");
    assert.strictEqual(payload.type, "Task");
    assert.strictEqual(payload.summary, "Test task");
  });

  it("converts markdown to ADF object", async () => {
    await create({
      project: "TEAM",
      type: "Task",
      summary: "Test",
      descriptionMarkdown: "# Hello\n\n**bold**",
    });

    const payload = capturedPayload as Record<string, unknown>;
    const description = payload.description as Record<string, unknown>;

    assert.strictEqual(description.type, "doc");
    assert.strictEqual(description.version, 1);
    assert.ok(Array.isArray(description.content));
  });

  it("includes labels as array", async () => {
    await create({
      project: "TEAM",
      type: "Task",
      summary: "Test",
      labels: ["bug", "urgent"],
    });

    const payload = capturedPayload as Record<string, unknown>;
    assert.deepStrictEqual(payload.labels, ["bug", "urgent"]);
  });

  it("includes custom fields as additionalAttributes", async () => {
    await create({
      project: "TEAM",
      type: "Task",
      summary: "Test",
      customFields: {
        customfield_10000: { value: "test" },
      },
    });

    const payload = capturedPayload as Record<string, unknown>;
    assert.deepStrictEqual(payload.additionalAttributes, {
      customfield_10000: { value: "test" },
    });
  });

  it("includes parent as parentIssueId", async () => {
    await create({
      project: "TEAM",
      type: "Sub-task",
      summary: "Test",
      parent: "TEAM-100",
    });

    const payload = capturedPayload as Record<string, unknown>;
    assert.strictEqual(payload.parentIssueId, "TEAM-100");
  });
});

describe("acli.workitem.edit", () => {
  beforeEach(() => {
    capturedPayload = null;
    capturedCommand = [];
  });

  it("wraps single key in issues array", async () => {
    await edit({
      key: "TEAM-123",
      summary: "Updated",
    });

    const payload = capturedPayload as Record<string, unknown>;
    assert.deepStrictEqual(payload.issues, ["TEAM-123"]);
  });

  it("passes array of keys as-is for batch editing", async () => {
    await edit({
      key: ["TEAM-123", "TEAM-124", "TEAM-125"],
      summary: "Batch update",
    });

    const payload = capturedPayload as Record<string, unknown>;
    assert.deepStrictEqual(payload.issues, ["TEAM-123", "TEAM-124", "TEAM-125"]);
  });

  it("converts markdown to ADF object", async () => {
    await edit({
      key: "TEAM-123",
      descriptionMarkdown: "# Updated\n\nNew content",
    });

    const payload = capturedPayload as Record<string, unknown>;
    const description = payload.description as Record<string, unknown>;

    assert.strictEqual(description.type, "doc");
    assert.strictEqual(description.version, 1);
  });

  it("separates labelsToAdd and labelsToRemove", async () => {
    await edit({
      key: "TEAM-123",
      labelsToAdd: ["done", "reviewed"],
      labelsToRemove: ["wip", "draft"],
    });

    const payload = capturedPayload as Record<string, unknown>;
    assert.deepStrictEqual(payload.labelsToAdd, ["done", "reviewed"]);
    assert.deepStrictEqual(payload.labelsToRemove, ["wip", "draft"]);
  });

  it("includes custom fields as additionalAttributes", async () => {
    await edit({
      key: "TEAM-123",
      customFields: {
        customfield_10000: { value: "updated" },
      },
    });

    const payload = capturedPayload as Record<string, unknown>;
    assert.deepStrictEqual(payload.additionalAttributes, {
      customfield_10000: { value: "updated" },
    });
  });

  it("only includes provided fields in payload", async () => {
    await edit({
      key: "TEAM-123",
      summary: "Only summary",
    });

    const payload = capturedPayload as Record<string, unknown>;
    assert.ok("issues" in payload);
    assert.ok("summary" in payload);
    assert.ok(!("description" in payload));
    assert.ok(!("labelsToAdd" in payload));
    assert.ok(!("assignee" in payload));
  });
});

describe("markdownToAdf integration", () => {
  it("produces valid ADF structure for workitem payloads", () => {
    const adf = markdownToAdf("# Title\n\n- Item 1\n- Item 2");

    assert.strictEqual(adf.type, "doc");
    assert.strictEqual(adf.version, 1);
    assert.ok(Array.isArray(adf.content));

    // Check for heading
    const heading = adf.content.find((n) => n.type === "heading");
    assert.ok(heading);

    // Check for bullet list
    const list = adf.content.find((n) => n.type === "bulletList");
    assert.ok(list);
  });

  it("handles tables for workitem descriptions", () => {
    const adf = markdownToAdf(`
| Col A | Col B |
| ----- | ----- |
| 1     | 2     |
`);

    const table = adf.content.find((n) => n.type === "table");
    assert.ok(table, "Should produce table node");
  });
});
