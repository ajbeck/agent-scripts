# agent-scripts

TypeScript automation tools for Claude Code. Following Anthropic's [code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp) pattern, these scripts enable efficient agent-tool interaction through filesystem-based progressive disclosure.

Inspired by [@steipete's agent-scripts](https://github.com/steipete/agent-scripts).

## Quick Start

Install into your project:

```sh
curl -fsSL https://raw.githubusercontent.com/ajbeck/agent-scripts/main/scripts/setup.ts | bun run -
```

That's it. Claude Code automatically discovers the tools and skills - no CLAUDE.md changes needed.

## What Gets Installed

```
your-project/
├── agent-scripts/
│   ├── lib/
│   │   ├── acli/           # Jira automation
│   │   │   ├── manifest.json
│   │   │   └── docs/*.md
│   │   ├── peekaboo/       # macOS automation
│   │   │   ├── manifest.json
│   │   │   └── docs/*.md
│   │   └── chrome/         # Browser automation
│   │       ├── manifest.json
│   │       └── docs/*.md
│   ├── config/
│   ├── package.json
│   └── AGENT_SCRIPTS.md    # Reference documentation
└── .claude/
    ├── rules/
    │   └── agent-scripts.md   # Auto-loaded instructions
    └── skills/
        ├── acli-jira/         # Full Jira API reference
        ├── peekaboo-macos/    # Full macOS automation API
        └── chrome-devtools/   # Full browser automation API
```

## Prerequisites

| Tool                                             | Required               | Purpose                         |
| ------------------------------------------------ | ---------------------- | ------------------------------- |
| [Bun](https://bun.sh)                            | Yes                    | JavaScript/TypeScript runtime   |
| [Chrome](https://www.google.com/chrome/)         | For browser automation | Browser for chrome-devtools-mcp |
| [acli](https://github.com/atlassian/acli)        | For Jira               | Atlassian CLI                   |
| [peekaboo](https://github.com/steipete/peekaboo) | For macOS automation   | macOS UI automation CLI         |

## Available Tools

| Tool       | Purpose                                           | Source          |
| ---------- | ------------------------------------------------- | --------------- |
| `acli`     | Jira workitems, projects, boards                  | `lib/acli/`     |
| `peekaboo` | macOS UI automation (screenshots, clicks, typing) | `lib/peekaboo/` |
| `chrome`   | Browser automation (navigate, click, screenshot)  | `lib/chrome/`   |
| `webDev`   | Combined Chrome + Peekaboo for web testing        | `lib/webdev/`   |
| `tui`      | Terminal UI testing                               | `lib/tui/`      |

### Quick Examples

```typescript
import { acli, peekaboo, chrome } from "./agent-scripts";

// Jira
const issues = await acli.workitem.search({ jql: "project = TEAM" });

// macOS automation
const capture = await peekaboo.captureForReview();
await peekaboo.click({ on: "B1" });
await capture.cleanup();

// Browser automation
await chrome.withBrowser(async () => {
  await chrome.navigate({ url: "https://example.com" });
  await chrome.screenshot({ filePath: "/tmp/screen.png" });
});
```

## Documentation Architecture

This project uses Claude Code's auto-discovery features for zero-config setup:

### Three-Tier System

| Tier          | Location                         | Loading                | Purpose                                          |
| ------------- | -------------------------------- | ---------------------- | ------------------------------------------------ |
| **Rules**     | `.claude/rules/agent-scripts.md` | Auto-loaded at startup | "These tools exist, here's how to discover them" |
| **Manifests** | `lib/{tool}/manifest.json`       | On-demand              | Function index by category                       |
| **Docs**      | `lib/{tool}/docs/*.md`           | On-demand              | Focused docs per category (~50-80 lines)         |
| **Skills**    | `.claude/skills/*/SKILL.md`      | Via `/skill-name`      | Full API reference                               |

### Progressive Disclosure

1. **Rules file** (always loaded): Tells Claude the tools exist
2. **Manifest** (agent reads when exploring): Lists all functions by category
3. **Category docs** (agent reads when needed): Specific function details
4. **Skills** (loaded via `/acli-jira` etc): Complete API reference

This keeps context small while enabling deep exploration when needed.

## Tool Discovery

Each library includes `manifest.json` and `docs/*.md` for incremental exploration:

```sh
# See what's available
cat agent-scripts/lib/chrome/manifest.json

# Read specific category
cat agent-scripts/lib/chrome/docs/input.md
```

Or use skills for full API reference: `/chrome-devtools`, `/peekaboo-macos`, `/acli-jira`

## Installation Options

```sh
# Install to current directory
curl -fsSL https://raw.githubusercontent.com/ajbeck/agent-scripts/main/scripts/setup.ts | bun run -

# Install to specific directory
curl -fsSL ... | bun run - --target /path/to/project

# With Jira project configuration
curl -fsSL ... | bun run - --project MYPROJ

# Preview changes
curl -fsSL ... | bun run - --dry-run
```

| Option            | Description                           |
| ----------------- | ------------------------------------- |
| `--target <path>` | Target directory (default: current)   |
| `--project <key>` | Default Jira project key for examples |
| `--dry-run`       | Preview changes without making them   |
| `--skip-deps`     | Skip dependency installation          |

## Updating

```sh
bun run agent-scripts/setup.ts
```

The setup script auto-detects existing installations and updates files while preserving `node_modules`.

## How It Works

Following Anthropic's "code execution with MCP" pattern:

1. **Progressive disclosure**: Claude discovers tools by reading manifests, not loading all definitions upfront
2. **On-demand loading**: Only loads the functions needed for the current task
3. **Code execution**: Claude writes TypeScript to call tools, enabling data transformation and control flow
4. **Auto-discovery**: Rules and skills are automatically found by Claude Code

## Development

```sh
bun install
bun test
```

## Dependencies

- [Bun](https://bun.sh) - JavaScript runtime
- [@atlaskit/editor-markdown-transformer](https://www.npmjs.com/package/@atlaskit/editor-markdown-transformer) - Markdown to ADF
- [mcporter](https://github.com/anthropics/mcporter) - MCP runtime for TypeScript
- [acli](https://github.com/atlassian/acli) - Atlassian CLI (external)
- [peekaboo](https://github.com/steipete/peekaboo) - macOS automation (external)
- [chrome-devtools-mcp](https://github.com/anthropics/chrome-devtools-mcp) - Browser automation (via npx)
