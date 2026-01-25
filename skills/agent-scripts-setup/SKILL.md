---
name: agent-scripts-setup
description: Install, update, and troubleshoot agent-scripts automation tools.
source: agent-scripts
version: "1.0.0"
---

# Agent Scripts Setup

Install and manage agent-scripts automation tools for Claude Code.

## Installation

Fresh install to current directory:

```sh
curl -fsSL https://raw.githubusercontent.com/ajbeck/agent-scripts/main/scripts/setup.ts | bun run -
```

Install to specific directory:

```sh
curl -fsSL https://raw.githubusercontent.com/ajbeck/agent-scripts/main/scripts/setup.ts | bun run - --target /path/to/project
```

With Jira project configuration:

```sh
curl -fsSL https://raw.githubusercontent.com/ajbeck/agent-scripts/main/scripts/setup.ts | bun run - --project MYPROJ
```

## Updating

From project root (auto-detects installation):

```sh
bun run agent-scripts/setup.ts
```

Or re-run the curl install command - it detects existing installations and updates.

## What Gets Installed

```
your-project/
├── agent-scripts/
│   ├── lib/
│   │   ├── acli/           # Jira automation
│   │   ├── peekaboo/       # macOS automation
│   │   └── chrome/         # Browser automation
│   ├── config/
│   ├── setup.ts            # This setup script
│   ├── version.ts          # Version info
│   └── AGENT_SCRIPTS.md    # Reference documentation
└── .claude/
    ├── rules/
    │   └── agent-scripts.md   # Auto-loaded instructions
    └── skills/
        ├── acli-jira/
        ├── peekaboo-macos/
        ├── chrome-devtools/
        └── ...
```

## Options

| Option            | Description                                     |
| ----------------- | ----------------------------------------------- |
| `--target <path>` | Target directory (auto-detected if in existing) |
| `--project <key>` | Default Jira project key for examples           |
| `--dry-run`       | Preview changes without making them             |
| `--skip-deps`     | Skip dependency installation                    |

## Check Version

```sh
grep VERSION agent-scripts/version.ts
```

Or check skill front matter:

```sh
head -10 .claude/skills/chrome-devtools/SKILL.md
```

## Troubleshooting

### "Cannot find module" errors

Re-run setup to ensure all files are present:

```sh
bun run agent-scripts/setup.ts
```

### Dependencies missing

```sh
cd agent-scripts && bun install
```

### Skills not appearing

Ensure `.claude/skills/` exists and contains skill directories:

```sh
ls -la .claude/skills/
```

### Old version after update

Check that version.ts was updated:

```sh
cat agent-scripts/version.ts
```

If still old, force re-download:

```sh
curl -fsSL https://raw.githubusercontent.com/ajbeck/agent-scripts/main/scripts/setup.ts | bun run -
```

## Prerequisites

| Tool                                             | Required               | Purpose                         |
| ------------------------------------------------ | ---------------------- | ------------------------------- |
| [Bun](https://bun.sh)                            | Yes                    | JavaScript/TypeScript runtime   |
| [Chrome](https://www.google.com/chrome/)         | For browser automation | Browser for chrome-devtools-mcp |
| [acli](https://github.com/atlassian/acli)        | For Jira               | Atlassian CLI                   |
| [peekaboo](https://github.com/steipete/peekaboo) | For macOS automation   | macOS UI automation CLI         |

## Related Skills

- `/acli-jira` - Jira automation API
- `/peekaboo-macos` - macOS automation API
- `/chrome-devtools` - Browser automation API
- `/web-dev-assist` - Web development workflow
- `/tui-dev-assist` - Terminal UI testing workflow
