Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## Git Workflows

- Safe by default: `git status/diff/log`. Push only when user asks.
- `git checkout` ok for PR review / explicit request.
- Branch changes require user consent.
- Destructive ops forbidden unless explicit (`reset --hard`, `clean`, `restore`, `rm`, …).
- Don't delete/rename unexpected stuff; stop + ask.
- No repo-wide S/R scripts; keep edits small/reviewable.
- Avoid manual `git stash`; if Git auto-stashes during pull/rebase, that's fine (hint, not hard guardrail).
- If user types a command ("pull and push"), that's consent for that command.
- No amend unless asked.
- Big review: `git --no-pager diff --color=never`.
- Multi-agent: check `git status/diff` before edits; ship small commits.
- For commit messages use the conventional commits specification: https://www.conventionalcommits.org/en/v1.0.0/ more info here: https://github.com/conventional-commits/conventionalcommits.org/tree/master/content/v1.0.0/index.md

## Committing Changes

When the user asks to commit, use the `committer` script (available on PATH):

```sh
committer "feat: description of change" file1.ts file2.ts
```

The script handles staging and committing. Use conventional commit format for the message.

Do NOT manually run `git add` and `git commit` - always use `committer` instead.

## Formatting

Format markdown files after editing using prettier (globally installed or via npx):

```sh
prettier --write "**/*.md"
# or if not globally installed:
npx prettier --write "**/*.md"
```

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

## Documentation Research

Use the `summarize` command to fetch and summarize documentation from the web.

### Basic Usage

```sh
# Summarize a web page
summarize "https://example.com/docs"

# Extract raw content without LLM summary
summarize "https://example.com/docs" --extract

# Extract as markdown (preferred for documentation)
summarize "https://example.com/docs" --extract --format md

# Summarize YouTube videos (auto-extracts transcript)
summarize "https://www.youtube.com/watch?v=..."
```

### Useful Options

- `--extract` - Get raw content without summarization (useful for full docs)
- `--format md` - Extract content as markdown
- `--length <short|medium|long|xl|xxl>` - Control summary length (default: xl)
- `--plain` - Output without ANSI formatting (for piping/saving)
- `--prompt <text>` - Custom instruction for the summary
- `--no-cache` - Bypass cache for fresh content

### Examples for Documentation Research

```sh
# Get full API documentation as markdown
summarize "https://bun.sh/docs/api/file-io" --extract --format md

# Summarize with specific focus
summarize "https://docs.example.com/api" --prompt "Focus on authentication methods and code examples"

# Save extracted docs to a file
summarize "https://example.com/docs" --extract --format md --plain > docs.md
```

## GitHub CLI (gh)

Use `gh` for GitHub interactions instead of the GitHub API directly.

### Browsing Repository Content

```sh
# Open repo in browser
gh browse --repo owner/repo

# Get raw file content URL (use with summarize for docs)
gh browse --repo owner/repo --no-browser path/to/file.md

# View README
gh repo view owner/repo
```

### Issues and PRs

```sh
# View issue/PR details
gh issue view 123 --repo owner/repo
gh pr view 456 --repo owner/repo

# List issues/PRs
gh issue list --repo owner/repo
gh pr list --repo owner/repo
```

### API Access

```sh
# Raw API calls when needed
gh api repos/owner/repo/contents/path/to/file
```

## Task Management

Break implementation into small discrete tasks to avoid AWS Bedrock output token limits. Use TodoWrite to track progress and complete one task at a time before moving to the next.

## Agent Scripts

TypeScript interfaces for automation. Import from `./scripts`:

```typescript
import { acli, peekaboo, chrome, markdownToAdf } from "./scripts";
```

| Tool            | Purpose                                           | Source                     |
| --------------- | ------------------------------------------------- | -------------------------- |
| `acli`          | Jira workitems, projects, boards                  | `scripts/lib/acli/`        |
| `peekaboo`      | macOS UI automation (screenshots, clicks, typing) | `scripts/lib/peekaboo/`    |
| `chrome`        | Browser automation (navigate, click, screenshot)  | `scripts/lib/chrome/`      |
| `markdownToAdf` | Convert markdown to Atlassian Document Format     | `scripts/lib/md-to-adf.ts` |

### acli - Jira

```typescript
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
  bodyMarkdown: "Comment text",
});
await acli.workitem.transition({ key: "TEAM-123", status: "Done" });
```

### peekaboo - macOS Automation

```typescript
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

### chrome - Browser Automation

```typescript
// Navigate and snapshot
await chrome.navigate({ url: "https://example.com" });
const snapshot = await chrome.snapshot(); // Returns element UIDs

// Interact with elements (UIDs from snapshot)
await chrome.click({ uid: "button-123" });
await chrome.fill({ uid: "input-456", value: "hello" });
await chrome.pressKey({ key: "Enter" });

// Wait and screenshot
await chrome.waitFor({ text: "Success" });
await chrome.screenshot({ filePath: "/tmp/screen.png" });

// Clean up
await chrome.close();
```

**For full APIs, read the TypeScript source files or use the skills in `.claude/skills/`.**

## Installing to Other Projects

Use the setup script to copy agent-scripts tools to another project:

```sh
bun run scripts/setup.ts --target /path/to/project
```

Options:

- `--target <path>` - Target project directory (required)
- `--dry-run` - Preview changes without applying
- `--skip-deps` - Skip dependency installation

The script will:

1. Copy `scripts/lib/` and `scripts/md-to-adf.ts` to the target
2. Install required npm dependencies
3. Generate a `CLAUDE_SNIPPET.md` with CLAUDE.md content to add
