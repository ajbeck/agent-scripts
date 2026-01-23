# agent-scripts

A collection of TypeScript tools designed for Claude Code to discover and execute. Following the [code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp) pattern, these scripts enable efficient agent-tool interaction through filesystem-based progressive disclosure.

Inspired by [@steipete's agent-scripts](https://github.com/steipete/agent-scripts) - check out his repo for additional patterns and tools.

## Quick Start

Install into your project with a single command:

```sh
cd /path/to/your-project
curl -fsSL https://raw.githubusercontent.com/ajbeck/agent-scripts/main/scripts/setup.ts | bun run -
```

This creates:

- `agent-scripts/` - Self-contained folder with TypeScript libraries
- `.claude/skills/` - On-demand documentation that Claude loads when needed

Then add to your `CLAUDE.md`:

```markdown
@agent-scripts/AGENT_SCRIPTS.md
```

See [Installation Options](#installation-options) for more configuration.

## Prerequisites

The following must be installed and available in PATH:

| Tool                                             | Required             | Purpose                              |
| ------------------------------------------------ | -------------------- | ------------------------------------ |
| [Bun](https://bun.sh)                            | Yes                  | JavaScript/TypeScript runtime        |
| [Node.js/npm](https://nodejs.org)                | Yes                  | Package management, npx              |
| [acli](https://github.com/atlassian/acli)        | For Jira             | Atlassian CLI for Jira integration   |
| [peekaboo](https://github.com/steipete/peekaboo) | For macOS automation | macOS UI automation CLI              |
| [prettier](https://prettier.io)                  | Optional             | Markdown formatting (or use via npx) |

## Available Tools

| Tool            | Purpose                                           | Source                     |
| --------------- | ------------------------------------------------- | -------------------------- |
| `acli`          | Jira workitems, projects, boards                  | `scripts/lib/acli/`        |
| `peekaboo`      | macOS UI automation (screenshots, clicks, typing) | `scripts/lib/peekaboo/`    |
| `markdownToAdf` | Convert markdown to Atlassian Document Format     | `scripts/lib/md-to-adf.ts` |

### ACLI Jira Interface

TypeScript interface for the `acli` CLI tool with automatic markdown-to-ADF conversion.

```typescript
import { acli } from "./agent-scripts";

// Search and view
const issues = await acli.workitem.search({ jql: "project = TEAM" });
const issue = await acli.workitem.view("TEAM-123");

// Create/edit (use descriptionMarkdown for auto-conversion)
await acli.workitem.create({
  project: "TEAM",
  type: "Task",
  summary: "Title",
  descriptionMarkdown: "# Desc",
});
await acli.workitem.edit({ key: "TEAM-123", descriptionMarkdown: "Updated" });

// Comments and transitions
await acli.workitem.comment.create({
  key: "TEAM-123",
  bodyMarkdown: "Comment",
});
await acli.workitem.transition({ key: "TEAM-123", status: "Done" });
```

CLI usage:

```sh
bun run agent-scripts/acli.ts workitem view TEAM-123
bun run agent-scripts/acli.ts workitem search --jql "project = TEAM"
```

### Peekaboo macOS Automation

TypeScript interface for macOS UI automation via the `peekaboo` CLI.

```typescript
import { peekaboo } from "./agent-scripts";

// Vision and screenshots
const { data } = await peekaboo.see({ annotate: true }); // Detect UI elements
await peekaboo.image({ path: "/tmp/screenshot.png" });

// Interaction (use element IDs from see())
await peekaboo.click({ on: "B1" });
await peekaboo.type({ text: "Hello" });
await peekaboo.hotkey({ keys: ["cmd", "c"] });

// Apps and windows
await peekaboo.app.launch({ name: "Safari" });
await peekaboo.window.focus({ app: "Safari" });
```

### Markdown to ADF Converter

Convert Markdown to Atlassian Document Format (ADF) for Jira/Confluence.

```typescript
import { markdownToAdf } from "./agent-scripts";

const adf = markdownToAdf("# Hello\n\n**bold** text");
```

CLI usage:

```sh
echo "# Hello" | bun run agent-scripts/md-to-adf.ts
bun run agent-scripts/md-to-adf.ts --input README.md
```

### GitHub Workflow Validator

Validate GitHub Actions workflow YAML files against the official JSON schema.

```sh
bun run agent-scripts/validate-workflow.ts .github/workflows/ci.yml
```

## Installation Options

The setup script creates a self-contained installation:

```
your-project/
├── agent-scripts/
│   ├── package.json        # Dependencies isolated here
│   ├── node_modules/       # Ignored by .gitignore
│   ├── AGENT_SCRIPTS.md    # Concise documentation for CLAUDE.md
│   ├── index.ts
│   └── lib/...
└── .claude/
    └── skills/             # On-demand detailed documentation
        ├── acli-jira/SKILL.md
        └── peekaboo-macos/SKILL.md
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

### Updating

Re-run the setup script to update an existing installation:

```sh
# Remote update
curl -fsSL https://raw.githubusercontent.com/ajbeck/agent-scripts/main/scripts/setup.ts | bun run -

# Or use the self-update script
bun run agent-scripts/selfUpdate.ts
```

The script detects existing installations and updates all source files while preserving `node_modules`.

## Documentation Architecture

This project follows Anthropic's [best practices for CLAUDE.md](https://code.claude.com/docs/en/best-practices):

### Two-Tier Documentation

1. **AGENT_SCRIPTS.md** (always loaded via `@agent-scripts/AGENT_SCRIPTS.md`)
   - Concise reference (~60 lines)
   - Import statements and quick examples
   - Enough for common operations

2. **Skills** (loaded on-demand by Claude when needed)
   - Full API documentation
   - Detailed examples and edge cases
   - Located in `.claude/skills/`

### Why This Approach?

- **Context efficiency**: CLAUDE.md should be under 500 lines total
- **On-demand loading**: Claude loads skills only when working with specific tools
- **Progressive disclosure**: Quick reference for simple tasks, detailed docs when needed

### Skills Reference

| Skill            | Description               | Triggers                                      |
| ---------------- | ------------------------- | --------------------------------------------- |
| `acli-jira`      | Full Jira API reference   | Working with Jira workitems, projects, boards |
| `peekaboo-macos` | Full macOS automation API | UI automation, screenshots, app control       |

Claude automatically loads relevant skills based on the task context.

## How It Works

This follows the "code execution with MCP" pattern from Anthropic:

1. **Progressive Disclosure**: Claude discovers tools by reading `agent-scripts/lib/` rather than loading all definitions upfront
2. **On-Demand Loading**: Only imports the functions needed for the current task
3. **Code Execution**: Claude writes TypeScript to call tools, allowing data transformation and control flow
4. **Skill Reuse**: Functions in `agent-scripts/lib/` act as reusable skills
5. **Two-Tier Docs**: Concise always-on docs + detailed on-demand skills

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
- [ajv](https://www.npmjs.com/package/ajv) - JSON schema validator
- [ajv-formats](https://www.npmjs.com/package/ajv-formats) - Format validators for Ajv
- [acli](https://github.com/atlassian/acli) - Atlassian CLI (external, must be in PATH)
- [peekaboo](https://github.com/steipete/peekaboo) - macOS automation CLI (external, must be in PATH)
