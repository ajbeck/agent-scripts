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
  // acli
  "scripts/lib/acli/index.ts",
  "scripts/lib/acli/base.ts",
  "scripts/lib/acli/workitem.ts",
  "scripts/lib/acli/project.ts",
  "scripts/lib/acli/board.ts",
  "scripts/lib/acli/utils.ts",
  // peekaboo
  "scripts/lib/peekaboo/index.ts",
  "scripts/lib/peekaboo/base.ts",
  "scripts/lib/peekaboo/types.ts",
  "scripts/lib/peekaboo/list.ts",
  "scripts/lib/peekaboo/image.ts",
  "scripts/lib/peekaboo/see.ts",
  "scripts/lib/peekaboo/click.ts",
  "scripts/lib/peekaboo/input.ts",
  "scripts/lib/peekaboo/hotkey.ts",
  "scripts/lib/peekaboo/press.ts",
  "scripts/lib/peekaboo/scroll.ts",
  "scripts/lib/peekaboo/move.ts",
  "scripts/lib/peekaboo/drag.ts",
  "scripts/lib/peekaboo/paste.ts",
  "scripts/lib/peekaboo/app.ts",
  "scripts/lib/peekaboo/window.ts",
  "scripts/lib/peekaboo/clipboard.ts",
  "scripts/lib/peekaboo/menu.ts",
  "scripts/lib/peekaboo/dialog.ts",
  "scripts/lib/peekaboo/dock.ts",
  "scripts/lib/peekaboo/space.ts",
  "scripts/lib/peekaboo/open.ts",
  "scripts/lib/peekaboo/agent.ts",
  // chrome
  "scripts/lib/chrome/index.ts",
  "scripts/lib/chrome/base.ts",
  "scripts/lib/chrome/types.ts",
  "scripts/lib/chrome/input.ts",
  "scripts/lib/chrome/navigation.ts",
  "scripts/lib/chrome/debugging.ts",
  "scripts/lib/chrome/performance.ts",
  "scripts/lib/chrome/network.ts",
  "scripts/lib/chrome/emulation.ts",
  // config
  "config/mcporter.json",
];

const SKILLS_TO_UPDATE = [
  "skills/acli-jira/SKILL.md",
  "skills/peekaboo-macos/SKILL.md",
  "skills/chrome-devtools/SKILL.md",
];

const DEPENDENCIES = [
  "@atlaskit/adf-schema",
  "@atlaskit/editor-json-transformer",
  "@atlaskit/editor-markdown-transformer",
  "ajv",
  "ajv-formats",
  "mcporter",
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
    // Handle paths that don't start with "scripts/"
    let relativePath: string;
    if (filePath.startsWith("scripts/")) {
      relativePath = filePath.replace("scripts/", "");
    } else {
      relativePath = filePath;
    }
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
 * Update skills from GitHub
 */
async function updateSkills(
  agentScriptsDir: string,
  dryRun: boolean
): Promise<number> {
  let updatedCount = 0;

  // Skills are installed in the project root's .claude/skills/ directory
  // agentScriptsDir is <project>/agent-scripts, so project root is parent
  const projectRoot = dirname(agentScriptsDir);
  const skillsDir = join(projectRoot, ".claude/skills");

  console.log("Checking skills for updates...\n");

  for (const skillPath of SKILLS_TO_UPDATE) {
    const skillName = skillPath.split("/")[1]; // e.g., "acli-jira"
    const localPath = join(skillsDir, skillName, "SKILL.md");

    try {
      const remoteContent = await downloadFile(skillPath);
      const changed = await hasChanged(localPath, remoteContent);

      if (changed) {
        if (dryRun) {
          console.log(`  Would update skill: ${skillName}`);
        } else {
          // Ensure directory exists
          const dir = dirname(localPath);
          await Bun.$`mkdir -p ${dir}`.quiet();

          await Bun.write(localPath, remoteContent);
          console.log(`  Updated skill: ${skillName}`);
        }
        updatedCount++;
      }
    } catch (error) {
      console.error(`  Error updating skill ${skillName}: ${error}`);
    }
  }

  if (updatedCount === 0) {
    console.log("  All skills are up to date");
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
  const filesUpdated = await updateFiles(agentScriptsDir, dryRun);

  // Update skills
  const skillsUpdated = await updateSkills(agentScriptsDir, dryRun);

  const totalUpdated = filesUpdated + skillsUpdated;

  // Update dependencies if files changed
  if (!skipDeps && totalUpdated > 0) {
    console.log("\nUpdating dependencies...");
    await ensureDeps(agentScriptsDir, dryRun);
  } else if (skipDeps) {
    console.log("\nSkipping dependency check (--skip-deps)");
  }

  console.log("\n" + "=".repeat(60));
  if (dryRun) {
    console.log(`Dry run complete. ${filesUpdated} file(s) and ${skillsUpdated} skill(s) would be updated.`);
  } else if (totalUpdated > 0) {
    console.log(`Update complete. ${filesUpdated} file(s) and ${skillsUpdated} skill(s) updated.`);
  } else {
    console.log("Already up to date.");
  }
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
