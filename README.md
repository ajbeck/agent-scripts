# agent-scripts

A collection of TypeScript tools designed for Claude Code to discover and execute. Following the [code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp) pattern, these scripts enable efficient agent-tool interaction through filesystem-based progressive disclosure.

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

TypeScript interface for the `acli` CLI tool with automatic markdown-to-ADF conversion.

```typescript
import { acli } from "./scripts";

// Create workitem with markdown (auto-converts to ADF)
await acli.workitem.create({
  project: "TEAM",
  type: "Task",
  summary: "New task",
  descriptionMarkdown: "# Overview\n\nThis is **bold** text.",
});

// Search workitems
const issues = await acli.workitem.search({ jql: "project = TEAM" });

// Add comment with markdown
await acli.workitem.comment.create({
  key: "TEAM-123",
  bodyMarkdown: "- Item 1\n- Item 2",
});
```

## Installing to Another Project

### Prerequisites

The target directory must have a `package.json`. Two options:

**Option 1: Install at repo root (recommended)**

```sh
cd /path/to/project
bun init -y  # if no package.json exists
bun run /path/to/agent-scripts/scripts/setup.ts --target .
```

Import path: `import { acli } from "./scripts"`

**Option 2: Install in a subdirectory**

Useful for isolating scripts in a dedicated folder:

```sh
mkdir -p tools/agent-scripts && cd tools/agent-scripts
bun init -y
bun run /path/to/agent-scripts/scripts/setup.ts --target .
```

Import path: `import { acli } from "./tools/agent-scripts/scripts"`

### Automated Setup

Run the setup script from your target directory:

```sh
bun run /path/to/agent-scripts/scripts/setup.ts --target .
```

Options:

- `--target <path>` - Target project directory (required)
- `--dry-run` - Show what would be done without making changes
- `--skip-deps` - Skip dependency installation

### Manual Setup

1. **Copy the scripts folder:**

   ```sh
   cp -r /path/to/agent-scripts/scripts/lib ./scripts/lib
   cp /path/to/agent-scripts/scripts/md-to-adf.ts ./scripts/
   ```

2. **Install dependencies:**

   ```sh
   bun add @atlaskit/adf-schema @atlaskit/editor-json-transformer @atlaskit/editor-markdown-transformer
   ```

3. **Add to your CLAUDE.md** (see template below)

## CLAUDE.md Configuration

After copying the scripts, add the following to your project's `CLAUDE.md` so Claude knows how to use the tools.

### Required Section

```markdown
## Agent Scripts

TypeScript tools are available in `scripts/lib/`. Import and use them in code:

\`\`\`typescript
import { acli, markdownToAdf } from "./scripts";

// Jira operations with markdown support
await acli.workitem.create({
project: "PROJECT_KEY",
type: "Task",
summary: "Task title",
descriptionMarkdown: "Markdown content here",
});

// Direct markdown to ADF conversion
const adf = markdownToAdf("# Heading\n\n**bold**");
\`\`\`

### Available Functions

- `acli.workitem.create()` - Create Jira issues (supports `descriptionMarkdown`)
- `acli.workitem.edit()` - Edit issues (supports `descriptionMarkdown`)
- `acli.workitem.search()` - Search with JQL
- `acli.workitem.view()` - Get issue details
- `acli.workitem.transition()` - Change issue status
- `acli.workitem.comment.create()` - Add comments (supports `bodyMarkdown`)
- `acli.project.list()` - List projects
- `acli.board.search()` - Search boards
- `markdownToAdf()` - Convert markdown string to ADF object
```

### Project-Specific Configuration

Add any project-specific details:

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
