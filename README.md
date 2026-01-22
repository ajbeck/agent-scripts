# agent-scripts

A collection of TypeScript tools designed for Claude Code to discover and execute. Following the [code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp) pattern, these scripts enable efficient agent-tool interaction through filesystem-based progressive disclosure.

Inspired by [@steipete's agent-scripts](https://github.com/steipete/agent-scripts) - check out his repo for additional patterns and tools.

## Prerequisites

The following must be installed and available in PATH:

| Tool                                      | Required | Purpose                              |
| ----------------------------------------- | -------- | ------------------------------------ |
| [Bun](https://bun.sh)                     | Yes      | JavaScript/TypeScript runtime        |
| [Node.js/npm](https://nodejs.org)         | Yes      | Package management, npx              |
| [acli](https://github.com/atlassian/acli) | Yes      | Atlassian CLI for Jira integration   |
| [prettier](https://prettier.io)           | Optional | Markdown formatting (or use via npx) |

## Available Tools

### Markdown to ADF Converter

Convert Markdown to Atlassian Document Format (ADF) for Jira/Confluence.

```typescript
import { markdownToAdf } from "./scripts";

const adf = markdownToAdf("# Hello\n\n**bold** text");
```

CLI usage:

```sh
echo "# Hello" | bun run scripts/md-to-adf.ts
bun run scripts/md-to-adf.ts --input README.md
```

### ACLI Jira Interface

TypeScript interface for the `acli` CLI tool with automatic markdown-to-ADF conversion. Uses acli's `--from-json` pattern internally for create/edit operations, enabling custom fields and batch editing.

```typescript
import { acli } from "./scripts";

// Create workitem with markdown (auto-converts to ADF)
await acli.workitem.create({
  project: "TEAM",
  type: "Task",
  summary: "New task",
  descriptionMarkdown: "# Overview\n\nThis is **bold** text.",
  customFields: { customfield_10000: { value: "custom value" } },
});

// Edit workitem (supports batch editing)
await acli.workitem.edit({
  key: "TEAM-123", // or ["TEAM-123", "TEAM-124"] for batch
  descriptionMarkdown: "# Updated\n\nNew description.",
  labelsToAdd: ["feature"],
  labelsToRemove: ["wip"],
});

// Search workitems
const issues = await acli.workitem.search({ jql: "project = TEAM" });

// Add comment with markdown
await acli.workitem.comment.create({
  key: "TEAM-123",
  bodyMarkdown: "- Item 1\n- Item 2",
});
```

#### CLI Usage

Scripts are also directly executable:

```sh
# View a workitem
./scripts/acli.ts workitem view TEAM-123

# Search workitems
./scripts/acli.ts workitem search --jql "project = TEAM" --limit 10

# Create a workitem
./scripts/acli.ts workitem create --project TEAM --type Task --summary "New task"

# Edit a workitem
./scripts/acli.ts workitem edit --key TEAM-123 --summary "Updated title"
```

#### How it works

1. Markdown is converted to ADF in-memory via `markdownToAdf()`
2. A JSON payload is built with the ADF object (not stringified)
3. Payload is written to a temp file (`/tmp/acli-{timestamp}.json`)
4. `acli jira workitem <cmd> --from-json <path>` is executed
5. Temp file is cleaned up (even on error)

## Installing to Another Project

### Quick Install (Remote)

No local clone needed - run directly from GitHub:

```sh
cd /path/to/project
bun run https://raw.githubusercontent.com/ajbeck/agent-scripts/main/scripts/setup.ts
```

The setup script will:

- Run `bun init` if no package.json exists
- Download all required files from GitHub
- Install dependencies
- Create `scripts/AGENT_SCRIPTS.md` documentation

### Local Install

If you have the repo cloned locally:

```sh
cd /path/to/project
bun run /path/to/agent-scripts/scripts/setup.ts
```

### Options

```sh
bun run setup.ts                                    # Install to current directory
bun run setup.ts --target /other/project            # Install to specific directory
bun run setup.ts --project MYPROJ --types Task,Bug  # With project config
bun run setup.ts --dry-run                          # Preview changes
bun run setup.ts --skip-deps                        # Skip dependency installation
```

| Option            | Description                                        |
| ----------------- | -------------------------------------------------- |
| `--target <path>` | Target directory (default: current directory)      |
| `--project <key>` | Default Jira project key for documentation         |
| `--types <types>` | Comma-separated issue types (e.g., Task,Bug,Story) |
| `--dry-run`       | Preview changes without making them                |
| `--skip-deps`     | Skip dependency installation                       |

### After Installation

Add to your project's `CLAUDE.md`:

```markdown
@scripts/AGENT_SCRIPTS.md
```

Import and use:

```typescript
import { acli } from "./scripts";
```

## CLAUDE.md Configuration

The setup script creates `scripts/AGENT_SCRIPTS.md` with full documentation. Reference it in your project's `CLAUDE.md`:

```markdown
@scripts/AGENT_SCRIPTS.md
```

You can also add project-specific settings:

```markdown
### Project Settings

- Default Jira project: `MYPROJECT`
- Issue types: Task, Bug, Story
- Common JQL: `project = MYPROJECT AND status != Done`
```

## How It Works

This follows the "code execution with MCP" pattern from Anthropic:

1. **Progressive Disclosure**: Claude discovers tools by reading `scripts/lib/` rather than loading all definitions upfront
2. **On-Demand Loading**: Only imports the functions needed for the current task
3. **Code Execution**: Claude writes TypeScript to call tools, allowing data transformation and control flow
4. **Skill Reuse**: Functions in `scripts/lib/` act as reusable skills

## Development

```sh
# Install dependencies
bun install

# Run tests
bun test

# Test markdown converter
echo "# Test" | bun run scripts/md-to-adf.ts
```

## Dependencies

- [Bun](https://bun.sh) - JavaScript runtime
- [@atlaskit/adf-schema](https://www.npmjs.com/package/@atlaskit/adf-schema) - ADF schema definitions
- [@atlaskit/editor-markdown-transformer](https://www.npmjs.com/package/@atlaskit/editor-markdown-transformer) - Markdown to ProseMirror
- [@atlaskit/editor-json-transformer](https://www.npmjs.com/package/@atlaskit/editor-json-transformer) - ProseMirror to ADF JSON
- [acli](https://github.com/atlassian/acli) - Atlassian CLI (must be installed separately and in PATH)
