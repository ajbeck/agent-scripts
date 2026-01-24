#!/usr/bin/env bun

/**
 * Self-update script for agent-scripts.
 *
 * Downloads the latest version from GitHub and updates the local installation.
 *
 * Usage:
 *   bun run agent-scripts/selfUpdate.ts
 *   bun run agent-scripts/selfUpdate.ts --dry-run
 */

import { join, dirname } from "path";
import { existsSync } from "fs";

const GITHUB_REPO = "ajbeck/agent-scripts";
const GITHUB_BRANCH = "main";

const DEPENDENCIES = [
  "@atlaskit/adf-schema",
  "@atlaskit/editor-json-transformer",
  "@atlaskit/editor-markdown-transformer",
  "ajv",
  "ajv-formats",
  "mcporter",
];

// Directories to copy from the repo
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

function printHelp() {
  console.log(`
agent-scripts self-update

Downloads the latest version from GitHub and updates files.

Usage:
  bun run selfUpdate.ts [options]

Options:
  --dry-run     Show what would be updated without making changes
  --skip-deps   Skip dependency update
  --help, -h    Show this help message
`);
}

function getAgentScriptsDir(): string {
  const scriptPath = import.meta.path.replace("file://", "");
  return dirname(scriptPath);
}

async function downloadAndUpdate(
  agentScriptsDir: string,
  dryRun: boolean,
): Promise<{ filesUpdated: number; skillsUpdated: number }> {
  const tarballUrl = `https://github.com/${GITHUB_REPO}/archive/refs/heads/${GITHUB_BRANCH}.tar.gz`;
  const projectRoot = dirname(agentScriptsDir);
  const tempDir = join(projectRoot, ".agent-scripts-temp");

  let filesUpdated = 0;
  let skillsUpdated = 0;

  console.log("Downloading from GitHub...");

  if (dryRun) {
    console.log(`  Would download: ${tarballUrl}`);
    console.log(`  Would update lib/, config/, skills/`);
    return { filesUpdated: 1, skillsUpdated: 1 }; // Placeholder for dry run
  }

  try {
    // Download and extract
    await Bun.$`mkdir -p ${tempDir}`.quiet();
    await Bun.$`curl -sL ${tarballUrl} | tar -xz -C ${tempDir} --strip-components=1`.quiet();
    console.log("  Downloaded and extracted");

    // Update directories
    for (const { src, dest } of DIRECTORIES_TO_COPY) {
      const srcPath = join(tempDir, src);
      const destPath = join(agentScriptsDir, dest);
      await Bun.$`rm -rf ${destPath}`.quiet().nothrow();
      await Bun.$`mkdir -p ${destPath}`.quiet();
      await Bun.$`cp -r ${srcPath}/* ${destPath}/`.quiet();
      console.log(`  Updated: ${dest}/`);
      filesUpdated++;
    }

    // Update top-level files
    for (const file of TOP_LEVEL_FILES) {
      const srcPath = join(tempDir, "scripts", file);
      const destPath = join(agentScriptsDir, file);
      if (existsSync(srcPath)) {
        await Bun.$`cp ${srcPath} ${destPath}`.quiet();
        console.log(`  Updated: ${file}`);
        filesUpdated++;
      }
    }

    // Update all skills
    const skillsSrcDir = join(tempDir, "skills");
    const skillsDestDir = join(projectRoot, ".claude/skills");
    await Bun.$`mkdir -p ${skillsDestDir}`.quiet();

    const result = await Bun.$`ls ${skillsSrcDir}`.quiet().nothrow();
    if (result.exitCode === 0) {
      const skills = result.text().trim().split("\n").filter(Boolean);
      for (const skill of skills) {
        const srcSkill = join(skillsSrcDir, skill);
        const destSkill = join(skillsDestDir, skill);
        await Bun.$`rm -rf ${destSkill}`.quiet().nothrow();
        await Bun.$`cp -r ${srcSkill} ${destSkill}`.quiet();
        console.log(`  Updated skill: ${skill}`);
        skillsUpdated++;
      }
    }

    // Update rules file
    const rulesDir = join(projectRoot, ".claude/rules");
    await Bun.$`mkdir -p ${rulesDir}`.quiet();
    await Bun.write(join(rulesDir, "agent-scripts.md"), generateRulesFile());
    console.log("  Updated: .claude/rules/agent-scripts.md");
  } finally {
    await Bun.$`rm -rf ${tempDir}`.quiet().nothrow();
  }

  return { filesUpdated, skillsUpdated };
}

async function updateDeps(dir: string, dryRun: boolean): Promise<void> {
  if (dryRun) {
    console.log(`  Would update: ${DEPENDENCIES.join(", ")}`);
    return;
  }
  console.log(`  Updating: ${DEPENDENCIES.join(", ")}`);
  await Bun.$`cd ${dir} && bun add ${DEPENDENCIES}`.quiet();
  console.log("  Done");
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
  console.log(`Location: ${agentScriptsDir}\n`);

  // Download and update
  const { filesUpdated, skillsUpdated } = await downloadAndUpdate(
    agentScriptsDir,
    dryRun,
  );

  // Update dependencies
  if (!skipDeps) {
    console.log("\nUpdating dependencies...");
    await updateDeps(agentScriptsDir, dryRun);
  }

  console.log("\n" + "=".repeat(50));
  if (dryRun) {
    console.log("Dry run complete.");
  } else {
    console.log(
      `Update complete. ${filesUpdated} dirs/files, ${skillsUpdated} skills updated.`,
    );
  }
  console.log("=".repeat(50));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
