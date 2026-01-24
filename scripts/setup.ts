#!/usr/bin/env bun

/**
 * Setup script to install or update agent-scripts in a project.
 *
 * Downloads the latest version from GitHub and installs it.
 * Can be re-run to update an existing installation.
 *
 * Usage:
 *   curl -fsSL https://raw.githubusercontent.com/ajbeck/agent-scripts/main/scripts/setup.ts | bun run -
 *   bun run scripts/setup.ts --target /path/to/project
 *
 * Options:
 *   --target <path>     Target directory (default: current directory)
 *   --project <key>     Default Jira project key (e.g., MYPROJECT)
 *   --dry-run           Show what would be done without making changes
 *   --skip-deps         Skip dependency installation
 */

import { join, resolve } from "path";
import { existsSync } from "fs";

const GITHUB_REPO = "ajbeck/agent-scripts";
const GITHUB_BRANCH = "main";
const FOLDER_NAME = "agent-scripts";

const DEPENDENCIES = [
  "@atlaskit/adf-schema",
  "@atlaskit/editor-json-transformer",
  "@atlaskit/editor-markdown-transformer",
  "ajv",
  "ajv-formats",
  "mcporter",
];

// Directories to copy from the repo (src -> dest relative to agent-scripts/)
const DIRECTORIES_TO_COPY = [
  { src: "scripts/lib", dest: "lib" },
  { src: "config", dest: "config" },
];

// Top-level files to copy from scripts/
const TOP_LEVEL_FILES = [
  "index.ts",
  "md-to-adf.ts",
  "acli.ts",
  "validate-workflow.ts",
  "selfUpdate.ts",
];

/**
 * Generate the auto-loaded rules file for .claude/rules/
 * This is automatically discovered by Claude Code - no user action needed
 */
function generateRulesFile(): string {
  return `# Agent Scripts

TypeScript automation libraries are available. Import from \`./agent-scripts\`:

\`\`\`typescript
import { acli, peekaboo, chrome } from "./agent-scripts";
\`\`\`

| Library    | Purpose                                           |
| ---------- | ------------------------------------------------- |
| \`acli\`     | Jira workitems, projects, boards                  |
| \`peekaboo\` | macOS UI automation (screenshots, clicks, typing) |
| \`chrome\`   | Browser automation (navigate, click, screenshot)  |

## Tool Discovery

Each library has \`manifest.json\` and \`docs/*.md\` for incremental exploration:

1. Read \`agent-scripts/lib/{library}/manifest.json\` for function index
2. Read \`agent-scripts/lib/{library}/docs/{category}.md\` for details

## Skills

Detailed API references are available as skills:
- \`/acli-jira\` - Full Jira API
- \`/peekaboo-macos\` - Full macOS automation API
- \`/chrome-devtools\` - Full browser automation API

## Reference

For quick examples and project settings: \`@agent-scripts/AGENT_SCRIPTS.md\`
`;
}

function generatePackageJson(): string {
  return JSON.stringify(
    {
      name: "agent-scripts",
      version: "1.0.0",
      private: true,
      type: "module",
    },
    null,
    2,
  );
}

function generateTsConfig(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: "ESNext",
        module: "ESNext",
        moduleResolution: "bundler",
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true,
        types: ["bun-types"],
      },
    },
    null,
    2,
  );
}

function generateAgentScriptsMd(project: string): string {
  const projectSection =
    project !== "PROJECT_KEY"
      ? `
## Project Settings

- **Default project**: \`${project}\`
- **Common JQL**: \`project = ${project} AND status != Done\`
`
      : "";

  return `# Agent Scripts

TypeScript interfaces for automation. Import from \`./agent-scripts\`:

\`\`\`typescript
import { acli, peekaboo, chrome, markdownToAdf } from "./agent-scripts";
\`\`\`

| Tool            | Purpose                                           | Source                          |
| --------------- | ------------------------------------------------- | ------------------------------- |
| \`acli\`          | Jira workitems, projects, boards                  | \`agent-scripts/lib/acli/\`       |
| \`peekaboo\`      | macOS UI automation (screenshots, clicks, typing) | \`agent-scripts/lib/peekaboo/\`   |
| \`chrome\`        | Browser automation (navigate, click, screenshot)  | \`agent-scripts/lib/chrome/\`     |
| \`markdownToAdf\` | Convert markdown to Atlassian Document Format     | \`agent-scripts/lib/md-to-adf.ts\` |

## Tool Discovery

For incremental exploration, each library includes:

- \`manifest.json\` - Index of all functions organized by category
- \`docs/*.md\` - Focused documentation per category

**Workflow:**

1. Read \`agent-scripts/lib/{library}/manifest.json\` to see categories
2. Read \`agent-scripts/lib/{library}/docs/{category}.md\` for details
3. Import and use: \`import { chrome } from "./agent-scripts"\`
${projectSection}
## Quick Examples

### acli - Jira

\`\`\`typescript
const issues = await acli.workitem.search({ jql: "project = ${project}" });
await acli.workitem.create({
  project: "${project}",
  type: "Task",
  summary: "Title",
  descriptionMarkdown: "# Description",
});
\`\`\`

### peekaboo - macOS Automation

\`\`\`typescript
const capture = await peekaboo.captureForReview();
await peekaboo.click({ on: "B1" });
await peekaboo.type({ text: "Hello" });
await capture.cleanup();
\`\`\`

### chrome - Browser Automation

\`\`\`typescript
await chrome.withBrowser(async () => {
  await chrome.navigate({ url: "https://example.com" });
  await chrome.screenshot({ filePath: "/tmp/screen.png" });
});
\`\`\`

**For full APIs, use the skills in \`.claude/skills/\` or read the manifest/docs.**

## Updating

\`\`\`sh
bun run agent-scripts/selfUpdate.ts
\`\`\`
`;
}

function printHelp() {
  console.log(`
agent-scripts setup

Install or update agent-scripts tools in a project.
Downloads from GitHub - no local clone needed.

Creates/Updates:
  <target>/agent-scripts/
    ├── lib/              # All libraries with docs/ and manifest.json
    ├── config/           # Configuration files
    ├── package.json
    └── ...
  <target>/.claude/skills/
    └── (all skills)

Usage:
  curl -fsSL https://raw.githubusercontent.com/${GITHUB_REPO}/main/scripts/setup.ts | bun run -
  bun run scripts/setup.ts --target /path/to/project

Options:
  --target <path>     Target directory (default: current directory)
  --project <key>     Default Jira project key (e.g., MYPROJECT)
  --dry-run           Show what would be done without making changes
  --skip-deps         Skip dependency installation
  --help, -h          Show this help message
`);
}

async function downloadAndExtract(
  agentScriptsDir: string,
  targetDir: string,
  dryRun: boolean,
): Promise<void> {
  const tarballUrl = `https://github.com/${GITHUB_REPO}/archive/refs/heads/${GITHUB_BRANCH}.tar.gz`;
  const tempDir = join(targetDir, ".agent-scripts-temp");

  console.log("Downloading from GitHub...");

  if (dryRun) {
    console.log(`  Would download: ${tarballUrl}`);
    console.log(`  Would copy: lib/, config/, skills/`);
    console.log(`  Would create: .claude/rules/agent-scripts.md (auto-loaded)`);
    return;
  }

  try {
    // Download and extract
    await Bun.$`mkdir -p ${tempDir}`.quiet();
    await Bun.$`curl -sL ${tarballUrl} | tar -xz -C ${tempDir} --strip-components=1`.quiet();
    console.log("  Downloaded and extracted");

    // Copy directories
    for (const { src, dest } of DIRECTORIES_TO_COPY) {
      const srcPath = join(tempDir, src);
      const destPath = join(agentScriptsDir, dest);
      await Bun.$`rm -rf ${destPath}`.quiet().nothrow();
      await Bun.$`mkdir -p ${destPath}`.quiet();
      await Bun.$`cp -r ${srcPath}/* ${destPath}/`.quiet();
      console.log(`  Copied: ${dest}/`);
    }

    // Copy top-level files
    for (const file of TOP_LEVEL_FILES) {
      const srcPath = join(tempDir, "scripts", file);
      const destPath = join(agentScriptsDir, file);
      if (existsSync(srcPath)) {
        await Bun.$`cp ${srcPath} ${destPath}`.quiet();
        console.log(`  Copied: ${file}`);
      }
    }

    // Copy all skills
    const skillsSrcDir = join(tempDir, "skills");
    const skillsDestDir = join(targetDir, ".claude/skills");
    await Bun.$`mkdir -p ${skillsDestDir}`.quiet();

    const result = await Bun.$`ls ${skillsSrcDir}`.quiet().nothrow();
    if (result.exitCode === 0) {
      const skills = result.text().trim().split("\n").filter(Boolean);
      for (const skill of skills) {
        const srcSkill = join(skillsSrcDir, skill);
        const destSkill = join(skillsDestDir, skill);
        await Bun.$`rm -rf ${destSkill}`.quiet().nothrow();
        await Bun.$`cp -r ${srcSkill} ${destSkill}`.quiet();
        console.log(`  Copied skill: ${skill}`);
      }
    }

    // Create auto-loaded rules file
    const rulesDir = join(targetDir, ".claude/rules");
    await Bun.$`mkdir -p ${rulesDir}`.quiet();
    await Bun.write(join(rulesDir, "agent-scripts.md"), generateRulesFile());
    console.log("  Created: .claude/rules/agent-scripts.md (auto-loaded)");
  } finally {
    await Bun.$`rm -rf ${tempDir}`.quiet().nothrow();
  }
}

async function writeConfigFiles(
  agentScriptsDir: string,
  dryRun: boolean,
): Promise<void> {
  const files = [
    { name: "package.json", content: generatePackageJson() },
    { name: "tsconfig.json", content: generateTsConfig() },
    { name: ".gitignore", content: "node_modules/\n" },
  ];

  for (const { name, content } of files) {
    if (dryRun) {
      console.log(`  Would create: ${name}`);
    } else {
      await Bun.write(join(agentScriptsDir, name), content);
      console.log(`  Created: ${name}`);
    }
  }
}

async function installDeps(dir: string, dryRun: boolean): Promise<void> {
  if (dryRun) {
    console.log(`  Would install: ${DEPENDENCIES.join(", ")}`);
    return;
  }
  console.log(`  Installing: ${DEPENDENCIES.join(", ")}`);
  await Bun.$`cd ${dir} && bun add ${DEPENDENCIES}`.quiet();
  console.log("  Done");
}

function getArg(args: string[], flag: string): string | undefined {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : undefined;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  const targetDir = resolve(getArg(args, "--target") || ".");
  const project = getArg(args, "--project") || "PROJECT_KEY";
  const dryRun = args.includes("--dry-run");
  const skipDeps = args.includes("--skip-deps");

  const agentScriptsDir = join(targetDir, FOLDER_NAME);
  const isUpdate = existsSync(agentScriptsDir);

  console.log(
    `\nAgent Scripts ${isUpdate ? "Update" : "Setup"}${dryRun ? " (dry run)" : ""}`,
  );
  console.log(`Target: ${agentScriptsDir}\n`);

  // Create directories
  if (!dryRun) {
    await Bun.$`mkdir -p ${agentScriptsDir}`.quiet();
  }

  // Write config files
  console.log("Creating config files...");
  await writeConfigFiles(agentScriptsDir, dryRun);

  // Download and copy files
  console.log("\nDownloading files...");
  await downloadAndExtract(agentScriptsDir, targetDir, dryRun);

  // Install dependencies
  if (!skipDeps) {
    console.log("\nInstalling dependencies...");
    await installDeps(agentScriptsDir, dryRun);
  }

  // Write documentation
  console.log("\nWriting documentation...");
  const docPath = join(agentScriptsDir, "AGENT_SCRIPTS.md");
  if (dryRun) {
    console.log("  Would create: AGENT_SCRIPTS.md");
  } else {
    await Bun.write(docPath, generateAgentScriptsMd(project));
    console.log("  Created: AGENT_SCRIPTS.md");
  }

  console.log("\n" + "=".repeat(50));
  console.log(`${isUpdate ? "Update" : "Setup"} complete!`);
  console.log("=".repeat(50));

  console.log(`
Installed:
  ${FOLDER_NAME}/              Libraries with manifest.json and docs/
  .claude/skills/          Detailed API references (auto-discovered)
  .claude/rules/           Instructions for Claude (auto-loaded)

Usage:
  import { acli, peekaboo, chrome } from "./${FOLDER_NAME}";

Claude Code will automatically discover the tools and skills.
No changes to CLAUDE.md required.
`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
