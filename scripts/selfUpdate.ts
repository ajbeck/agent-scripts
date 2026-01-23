#!/usr/bin/env bun

/**
 * Self-update script for agent-scripts.
 *
 * Fetches the latest files from GitHub and updates the local installation.
 *
 * Usage:
 *   bun run agent-scripts/selfUpdate.ts
 *   bun run agent-scripts/selfUpdate.ts --dry-run
 *   bun run agent-scripts/selfUpdate.ts --skip-deps
 */

import { join, dirname } from "path";

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/ajbeck/agent-scripts/main";

const FILES_TO_UPDATE = [
  "scripts/index.ts",
  "scripts/md-to-adf.ts",
  "scripts/acli.ts",
  "scripts/validate-workflow.ts",
  "scripts/selfUpdate.ts",
  "scripts/lib/index.ts",
  "scripts/lib/md-to-adf.ts",
  "scripts/lib/acli/index.ts",
  "scripts/lib/acli/base.ts",
  "scripts/lib/acli/workitem.ts",
  "scripts/lib/acli/project.ts",
  "scripts/lib/acli/board.ts",
  "scripts/lib/acli/utils.ts",
];

const DEPENDENCIES = [
  "@atlaskit/adf-schema",
  "@atlaskit/editor-json-transformer",
  "@atlaskit/editor-markdown-transformer",
  "ajv",
  "ajv-formats",
];

function printHelp() {
  console.log(`
agent-scripts self-update

Fetches the latest scripts from GitHub and updates the local installation.

Usage:
  bun run selfUpdate.ts [options]

Options:
  --dry-run     Show what would be updated without making changes
  --skip-deps   Skip dependency check/update
  --help, -h    Show this help message

Examples:
  bun run selfUpdate.ts              # Update to latest
  bun run selfUpdate.ts --dry-run    # Preview changes
`);
}

/**
 * Get the directory where this script is located (the agent-scripts folder)
 */
function getAgentScriptsDir(): string {
  const scriptPath = import.meta.path.replace("file://", "");
  return dirname(scriptPath);
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
 * Check if file content has changed
 */
async function hasChanged(
  localPath: string,
  remoteContent: string
): Promise<boolean> {
  const file = Bun.file(localPath);
  if (!(await file.exists())) {
    return true;
  }
  const localContent = await file.text();
  return localContent !== remoteContent;
}

/**
 * Update files from GitHub
 */
async function updateFiles(
  agentScriptsDir: string,
  dryRun: boolean
): Promise<number> {
  let updatedCount = 0;

  console.log("Checking for updates...\n");

  for (const filePath of FILES_TO_UPDATE) {
    const relativePath = filePath.replace("scripts/", "");
    const localPath = join(agentScriptsDir, relativePath);

    try {
      const remoteContent = await downloadFile(filePath);
      const changed = await hasChanged(localPath, remoteContent);

      if (changed) {
        if (dryRun) {
          console.log(`  Would update: ${relativePath}`);
        } else {
          // Ensure directory exists
          const dir = dirname(localPath);
          await Bun.$`mkdir -p ${dir}`.quiet();

          await Bun.write(localPath, remoteContent);
          console.log(`  Updated: ${relativePath}`);
        }
        updatedCount++;
      }
    } catch (error) {
      console.error(`  Error updating ${relativePath}: ${error}`);
    }
  }

  if (updatedCount === 0) {
    console.log("  All files are up to date");
  }

  return updatedCount;
}

/**
 * Ensure dependencies are installed
 */
async function ensureDeps(
  agentScriptsDir: string,
  dryRun: boolean
): Promise<void> {
  if (dryRun) {
    console.log(`  Would ensure dependencies: ${DEPENDENCIES.join(", ")}`);
    return;
  }

  console.log("  Checking dependencies...");
  await Bun.$`cd ${agentScriptsDir} && bun add ${DEPENDENCIES}`.quiet();
  console.log("  Dependencies up to date");
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  const dryRun = args.includes("--dry-run");
  const skipDeps = args.includes("--skip-deps");

  const agentScriptsDir = getAgentScriptsDir();

  console.log(`\nAgent Scripts Self-Update${dryRun ? " (dry run)" : ""}`);
  console.log(`Location: ${agentScriptsDir}`);
  console.log(`Source: ${GITHUB_RAW_BASE}\n`);

  // Update files
  const updatedCount = await updateFiles(agentScriptsDir, dryRun);

  // Update dependencies if files changed
  if (!skipDeps && updatedCount > 0) {
    console.log("\nUpdating dependencies...");
    await ensureDeps(agentScriptsDir, dryRun);
  } else if (skipDeps) {
    console.log("\nSkipping dependency check (--skip-deps)");
  }

  console.log("\n" + "=".repeat(60));
  if (dryRun) {
    console.log(`Dry run complete. ${updatedCount} file(s) would be updated.`);
  } else if (updatedCount > 0) {
    console.log(`Update complete. ${updatedCount} file(s) updated.`);
  } else {
    console.log("Already up to date.");
  }
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
