#!/usr/bin/env bun

/**
 * Setup script to install agent-scripts into a project.
 *
 * Usage (remote - no local clone needed):
 *   bun run https://raw.githubusercontent.com/ajbeck/agent-scripts/main/scripts/setup.ts
 *
 * Usage (local):
 *   bun run scripts/setup.ts
 *   bun run scripts/setup.ts --target /other/project
 *
 * Options:
 *   --target <path>   Target directory (default: current directory)
 *   --dry-run         Show what would be done without making changes
 *   --skip-deps       Skip dependency installation
 */

import { join, dirname, resolve } from "path";
import { existsSync } from "fs";

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/ajbeck/agent-scripts/main";

const DEPENDENCIES = [
  "@atlaskit/adf-schema",
  "@atlaskit/editor-json-transformer",
  "@atlaskit/editor-markdown-transformer",
];

const FILES_TO_DOWNLOAD = [
  "scripts/index.ts",
  "scripts/md-to-adf.ts",
  "scripts/lib/index.ts",
  "scripts/lib/md-to-adf.ts",
  "scripts/lib/acli/index.ts",
  "scripts/lib/acli/base.ts",
  "scripts/lib/acli/workitem.ts",
  "scripts/lib/acli/project.ts",
  "scripts/lib/acli/board.ts",
  "scripts/lib/acli/utils.ts",
];

const AGENT_SCRIPTS_MD = `# Agent Scripts

TypeScript tools for Jira operations. Uses acli's \`--from-json\` pattern internally.

## Usage

\`\`\`typescript
import { acli, markdownToAdf } from "./scripts";

// Create workitem with markdown (auto-converts to ADF)
await acli.workitem.create({
  project: "PROJECT_KEY",
  type: "Task",
  summary: "Task title",
  descriptionMarkdown: "# Heading\\n\\n**bold** text",
  labels: ["feature"],
  customFields: { customfield_10000: { value: "custom" } },
});

// Edit workitem (supports batch editing via key array)
await acli.workitem.edit({
  key: "KEY-123", // or ["KEY-123", "KEY-124"] for batch
  descriptionMarkdown: "Updated description",
  labelsToAdd: ["done"],
  labelsToRemove: ["wip"],
});

// Search and view
const issues = await acli.workitem.search({ jql: "project = PROJ" });
const issue = await acli.workitem.view("KEY-123");

// Add comment
await acli.workitem.comment.create({
  key: "KEY-123",
  bodyMarkdown: "Comment with **formatting**",
});
\`\`\`

## Function Reference

| Function                         | Key Options                                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| \`acli.workitem.create()\`       | \`project\`, \`type\`, \`summary\`, \`descriptionMarkdown\`, \`labels[]\`, \`customFields\`         |
| \`acli.workitem.edit()\`         | \`key\` (string or array), \`descriptionMarkdown\`, \`labelsToAdd[]\`, \`labelsToRemove[]\`, \`customFields\` |
| \`acli.workitem.search()\`       | \`jql\`, \`filter\`, \`fields\`, \`limit\`                                                          |
| \`acli.workitem.view()\`         | \`key\`, \`fields\`                                                                                 |
| \`acli.workitem.transition()\`   | \`key\`, \`status\`                                                                                 |
| \`acli.workitem.comment.create()\` | \`key\`, \`bodyMarkdown\`                                                                         |
| \`markdownToAdf()\`              | Returns ADF object from markdown string                                                             |
`;

function printHelp() {
  console.log(`
agent-scripts setup

Install agent-scripts tools into a project.

Usage:
  # Remote install (no local clone needed)
  bun run https://raw.githubusercontent.com/ajbeck/agent-scripts/main/scripts/setup.ts

  # Local install
  bun run scripts/setup.ts [options]

Options:
  --target <path>   Target directory (default: current directory)
  --dry-run         Show what would be done without making changes
  --skip-deps       Skip dependency installation
  --help, -h        Show this help message

Examples:
  bun run setup.ts                          # Install to current directory
  bun run setup.ts --target /path/to/proj   # Install to specific directory
  bun run setup.ts --dry-run                # Preview changes
`);
}

/**
 * Check if running from local clone (vs remote URL)
 * Returns true if the setup.ts is being run from within the agent-scripts repo
 */
function isRunningLocally(): boolean {
  // import.meta.path is the file path without file:// prefix in Bun
  const scriptPath = import.meta.path;

  // Check if it's a local file path (not a URL)
  if (scriptPath.startsWith("/") || scriptPath.startsWith("file://")) {
    const localPath = scriptPath.replace("file://", "");
    // The script is at agent-scripts/scripts/setup.ts
    // So sourceDir should be agent-scripts/
    const sourceDir = dirname(dirname(localPath));
    // Check if this is the agent-scripts repo by looking for scripts/lib
    const libPath = join(sourceDir, "scripts/lib");
    return existsSync(libPath);
  }
  return false;
}

/**
 * Get the source directory when running locally
 */
function getLocalSourceDir(): string {
  const scriptPath = import.meta.path.replace("file://", "");
  return dirname(dirname(scriptPath));
}

/**
 * Download a file from GitHub
 */
async function downloadFile(path: string): Promise<string> {
  const url = `${GITHUB_RAW_BASE}/${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }
  return response.text();
}

/**
 * Ensure package.json exists, run bun init if not
 */
async function ensurePackageJson(
  targetDir: string,
  dryRun: boolean
): Promise<void> {
  const pkgPath = join(targetDir, "package.json");
  const exists = await Bun.file(pkgPath).exists();

  if (!exists) {
    console.log("No package.json found, initializing with bun...");
    if (!dryRun) {
      await Bun.$`cd ${targetDir} && bun init -y`.quiet();
    }
    console.log("  Created package.json");
  }
}

/**
 * Copy files from local source
 */
async function copyFilesFromLocal(
  sourceDir: string,
  scriptsDir: string,
  dryRun: boolean
): Promise<void> {
  // Create directory structure
  if (!dryRun) {
    await Bun.$`mkdir -p ${join(scriptsDir, "lib/acli")}`.quiet();
  }

  // Copy lib folder
  console.log("Copying scripts/lib/...");
  if (dryRun) {
    console.log(`  Would copy: ${join(sourceDir, "scripts/lib")} -> ${join(scriptsDir, "lib")}`);
  } else {
    await Bun.$`cp -r ${join(sourceDir, "scripts/lib")}/* ${join(scriptsDir, "lib")}/`.quiet();
    console.log(`  Copied: scripts/lib/`);
  }

  // Copy top-level files
  for (const file of ["index.ts", "md-to-adf.ts"]) {
    const src = join(sourceDir, "scripts", file);
    const dest = join(scriptsDir, file);
    console.log(`Copying scripts/${file}...`);
    if (dryRun) {
      console.log(`  Would copy: ${src} -> ${dest}`);
    } else {
      await Bun.$`cp ${src} ${dest}`.quiet();
      console.log(`  Copied: scripts/${file}`);
    }
  }
}

/**
 * Download files from GitHub
 */
async function downloadFilesFromGithub(
  scriptsDir: string,
  dryRun: boolean
): Promise<void> {
  // Create directory structure
  if (!dryRun) {
    await Bun.$`mkdir -p ${join(scriptsDir, "lib/acli")}`.quiet();
  }

  console.log("Downloading files from GitHub...");

  for (const filePath of FILES_TO_DOWNLOAD) {
    const relativePath = filePath.replace("scripts/", "");
    const destPath = join(scriptsDir, relativePath);

    if (dryRun) {
      console.log(`  Would download: ${filePath}`);
    } else {
      console.log(`  Downloading: ${filePath}`);
      const content = await downloadFile(filePath);
      await Bun.write(destPath, content);
    }
  }

  console.log("  Download complete");
}

/**
 * Install dependencies
 */
async function installDeps(targetDir: string, dryRun: boolean): Promise<void> {
  const deps = DEPENDENCIES.join(" ");
  if (dryRun) {
    console.log(`  Would run: bun add ${deps}`);
    return;
  }
  console.log(`  Installing: ${deps}`);
  await Bun.$`cd ${targetDir} && bun add ${DEPENDENCIES}`.quiet();
  console.log("  Dependencies installed");
}

/**
 * Write AGENT_SCRIPTS.md documentation file
 */
async function writeDocumentation(
  scriptsDir: string,
  dryRun: boolean
): Promise<void> {
  const docPath = join(scriptsDir, "AGENT_SCRIPTS.md");

  if (dryRun) {
    console.log(`  Would create: ${docPath}`);
  } else {
    await Bun.write(docPath, AGENT_SCRIPTS_MD);
    console.log(`  Created: ${docPath}`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  // Parse arguments
  const targetIndex = args.indexOf("--target");
  const targetDir =
    targetIndex !== -1 && args[targetIndex + 1]
      ? args[targetIndex + 1]
      : ".";
  const dryRun = args.includes("--dry-run");
  const skipDeps = args.includes("--skip-deps");

  const absTargetDir = resolve(targetDir);
  const scriptsDir = join(absTargetDir, "scripts");
  const runningLocally = isRunningLocally();

  console.log(`\nAgent Scripts Setup${dryRun ? " (dry run)" : ""}`);
  console.log(`Target: ${absTargetDir}`);
  console.log(`Mode: ${runningLocally ? "local" : "remote"}\n`);

  // Ensure target directory exists
  if (!existsSync(absTargetDir)) {
    if (dryRun) {
      console.log(`Would create directory: ${absTargetDir}`);
    } else {
      await Bun.$`mkdir -p ${absTargetDir}`.quiet();
      console.log(`Created directory: ${absTargetDir}`);
    }
  }

  // Ensure package.json exists (runs bun init if needed)
  await ensurePackageJson(absTargetDir, dryRun);

  // Create scripts directory
  if (!dryRun) {
    await Bun.$`mkdir -p ${scriptsDir}`.quiet();
  }

  // Get files (local copy or remote download)
  if (runningLocally) {
    const sourceDir = getLocalSourceDir();
    console.log(`Source: ${sourceDir}\n`);
    await copyFilesFromLocal(sourceDir, scriptsDir, dryRun);
  } else {
    console.log(`Source: ${GITHUB_RAW_BASE}\n`);
    await downloadFilesFromGithub(scriptsDir, dryRun);
  }

  // Install dependencies
  if (!skipDeps) {
    console.log("\nInstalling dependencies...");
    await installDeps(absTargetDir, dryRun);
  } else {
    console.log("\nSkipping dependency installation (--skip-deps)");
  }

  // Write documentation
  console.log("\nCreating documentation...");
  await writeDocumentation(scriptsDir, dryRun);

  // Final instructions
  console.log("\n" + "=".repeat(60));
  console.log("Setup complete!");
  console.log("=".repeat(60));
  console.log(`
Next steps:
1. Add to your CLAUDE.md:
   @scripts/AGENT_SCRIPTS.md

2. Import and use:
   import { acli } from "./scripts";
`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
