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
import { VERSION, REPOSITORY } from "./version.ts";

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
  "version.ts",
];

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
};

// File change tracking
type ChangeType = "created" | "updated" | "unchanged";
const changes: { path: string; type: ChangeType }[] = [];

function logChange(path: string, type: ChangeType) {
  changes.push({ path, type });
  const indicators = {
    created: `${colors.green}[+]${colors.reset}`,
    updated: `${colors.yellow}[~]${colors.reset}`,
    unchanged: `${colors.gray}[=]${colors.reset}`,
  };
  console.log(`  ${indicators[type]} ${path}`);
}

/**
 * Compare file content and determine change type
 */
async function getChangeType(
  destPath: string,
  newContent: string
): Promise<ChangeType> {
  const file = Bun.file(destPath);
  if (!(await file.exists())) {
    return "created";
  }
  const existingContent = await file.text();
  return existingContent === newContent ? "unchanged" : "updated";
}

/**
 * Write file and track change
 */
async function writeTracked(
  destPath: string,
  content: string,
  displayPath: string
): Promise<void> {
  const changeType = await getChangeType(destPath, content);
  await Bun.write(destPath, content);
  logChange(displayPath, changeType);
}

/**
 * Copy file and track change
 */
async function copyTracked(
  srcPath: string,
  destPath: string,
  displayPath: string
): Promise<void> {
  const srcContent = await Bun.file(srcPath).text();
  const changeType = await getChangeType(destPath, srcContent);
  await Bun.write(destPath, srcContent);
  logChange(displayPath, changeType);
}

/**
 * Add version front matter to skill file
 */
function addSkillFrontMatter(content: string, newVersion: string): string {
  // Check if it already has front matter
  if (content.startsWith("---")) {
    // Parse existing front matter
    const endIndex = content.indexOf("---", 3);
    if (endIndex !== -1) {
      const frontMatter = content.substring(3, endIndex).trim();
      const body = content.substring(endIndex + 3);

      // Check if it already has source/version
      if (frontMatter.includes("source:") && frontMatter.includes("version:")) {
        // Update version if needed
        const updatedFrontMatter = frontMatter
          .replace(/version:.*/, `version: "${newVersion}"`)
          .replace(/source:.*/, `source: agent-scripts`);
        return `---\n${updatedFrontMatter}\n---${body}`;
      }

      // Add source and version to existing front matter
      const newFrontMatter = `${frontMatter}\nsource: agent-scripts\nversion: "${newVersion}"`;
      return `---\n${newFrontMatter}\n---${body}`;
    }
  }

  // No front matter, shouldn't happen for SKILL.md files
  return content;
}

/**
 * Generate the auto-loaded rules file for .claude/rules/
 */
function generateRulesFile(version: string): string {
  return `# Agent Scripts (v${version})

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

For quick examples: \`@agent-scripts/AGENT_SCRIPTS.md\`
`;
}

function printHelp() {
  console.log(`
${colors.bold}agent-scripts self-update v${VERSION}${colors.reset}

Downloads the latest version from GitHub and updates files.

${colors.bold}Usage:${colors.reset}
  bun run selfUpdate.ts [options]

${colors.bold}Options:${colors.reset}
  --dry-run     Show what would be updated without making changes
  --skip-deps   Skip dependency update
  --help, -h    Show this help message
`);
}

function getAgentScriptsDir(): string {
  const scriptPath = import.meta.path.replace("file://", "");
  return dirname(scriptPath);
}

/**
 * Recursively copy directory with file-level change tracking
 */
async function copyDirectoryTracked(
  srcDir: string,
  destDir: string,
  displayPrefix: string
): Promise<void> {
  const entries = await Bun.$`find ${srcDir} -type f`.quiet().text();
  const files = entries.trim().split("\n").filter(Boolean);

  for (const srcFile of files) {
    const relativePath = srcFile.replace(srcDir + "/", "");
    const destFile = join(destDir, relativePath);
    const displayPath = `${displayPrefix}/${relativePath}`;

    // Ensure parent directory exists
    const parentDir = dirname(destFile);
    await Bun.$`mkdir -p ${parentDir}`.quiet();

    await copyTracked(srcFile, destFile, displayPath);
  }
}

async function downloadAndUpdate(
  agentScriptsDir: string,
  dryRun: boolean
): Promise<{ newVersion: string }> {
  const tarballUrl = `https://github.com/${GITHUB_REPO}/archive/refs/heads/${GITHUB_BRANCH}.tar.gz`;
  const projectRoot = dirname(agentScriptsDir);
  const tempDir = join(projectRoot, ".agent-scripts-temp");

  console.log(`\n${colors.bold}Downloading from GitHub...${colors.reset}`);
  console.log(`  ${colors.gray}${tarballUrl}${colors.reset}`);

  if (dryRun) {
    console.log(
      `\n${colors.yellow}[dry-run] Would download and extract files${colors.reset}`
    );
    return { newVersion: VERSION };
  }

  let newVersion = VERSION;

  try {
    // Download and extract
    await Bun.$`mkdir -p ${tempDir}`.quiet();
    await Bun.$`curl -sL ${tarballUrl} | tar -xz -C ${tempDir} --strip-components=1`.quiet();
    console.log(`  ${colors.green}✓${colors.reset} Downloaded and extracted\n`);

    // Read new version from downloaded source
    const versionFile = join(tempDir, "scripts/version.ts");
    if (existsSync(versionFile)) {
      const versionContent = await Bun.file(versionFile).text();
      const match = versionContent.match(/VERSION\s*=\s*"([^"]+)"/);
      if (match) {
        newVersion = match[1];
      }
    }

    // Copy directories with file-level tracking
    for (const { src, dest } of DIRECTORIES_TO_COPY) {
      const srcPath = join(tempDir, src);
      const destPath = join(agentScriptsDir, dest);

      console.log(`${colors.bold}${dest}/${colors.reset}`);
      await Bun.$`mkdir -p ${destPath}`.quiet();

      await copyDirectoryTracked(srcPath, destPath, dest);
    }

    // Copy top-level files
    console.log(`\n${colors.bold}Root files${colors.reset}`);
    for (const file of TOP_LEVEL_FILES) {
      const srcPath = join(tempDir, "scripts", file);
      const destPath = join(agentScriptsDir, file);
      if (existsSync(srcPath)) {
        await copyTracked(srcPath, destPath, file);
      }
    }

    // Update all skills with version stamping
    console.log(`\n${colors.bold}.claude/skills/${colors.reset}`);
    const skillsSrcDir = join(tempDir, "skills");
    const skillsDestDir = join(projectRoot, ".claude/skills");
    await Bun.$`mkdir -p ${skillsDestDir}`.quiet();

    const result = await Bun.$`ls ${skillsSrcDir}`.quiet().nothrow();
    if (result.exitCode === 0) {
      const skills = result.text().trim().split("\n").filter(Boolean);
      for (const skill of skills) {
        const srcSkillDir = join(skillsSrcDir, skill);
        const destSkillDir = join(skillsDestDir, skill);
        await Bun.$`mkdir -p ${destSkillDir}`.quiet();

        // Copy SKILL.md with version front matter
        const skillMdSrc = join(srcSkillDir, "SKILL.md");
        const skillMdDest = join(destSkillDir, "SKILL.md");
        if (existsSync(skillMdSrc)) {
          const content = await Bun.file(skillMdSrc).text();
          const versionedContent = addSkillFrontMatter(content, newVersion);
          await writeTracked(skillMdDest, versionedContent, `${skill}/SKILL.md`);
        }
      }
    }

    // Update rules file
    console.log(`\n${colors.bold}.claude/rules/${colors.reset}`);
    const rulesDir = join(projectRoot, ".claude/rules");
    await Bun.$`mkdir -p ${rulesDir}`.quiet();
    await writeTracked(
      join(rulesDir, "agent-scripts.md"),
      generateRulesFile(newVersion),
      "agent-scripts.md"
    );
  } finally {
    await Bun.$`rm -rf ${tempDir}`.quiet().nothrow();
  }

  return { newVersion };
}

async function updateDeps(dir: string, dryRun: boolean): Promise<void> {
  console.log(`\n${colors.bold}Dependencies${colors.reset}`);

  if (dryRun) {
    console.log(
      `  ${colors.yellow}[dry-run]${colors.reset} Would update: ${DEPENDENCIES.join(", ")}`
    );
    return;
  }

  console.log(
    `  ${colors.gray}Updating: ${DEPENDENCIES.join(", ")}${colors.reset}`
  );
  await Bun.$`cd ${dir} && bun add ${DEPENDENCIES}`.quiet();
  console.log(`  ${colors.green}✓${colors.reset} Dependencies updated`);
}

function printSummary(
  dryRun: boolean,
  oldVersion: string,
  newVersion: string
): void {
  const created = changes.filter((c) => c.type === "created").length;
  const updated = changes.filter((c) => c.type === "updated").length;
  const unchanged = changes.filter((c) => c.type === "unchanged").length;

  console.log(`\n${"─".repeat(50)}`);
  console.log(`${colors.bold}Summary${colors.reset}`);
  console.log(`${"─".repeat(50)}`);

  if (dryRun) {
    console.log(`  ${colors.yellow}Dry run - no changes made${colors.reset}`);
  } else {
    console.log(`  ${colors.green}[+] Created:${colors.reset}   ${created} files`);
    console.log(`  ${colors.yellow}[~] Updated:${colors.reset}   ${updated} files`);
    console.log(`  ${colors.gray}[=] Unchanged:${colors.reset} ${unchanged} files`);
  }

  if (oldVersion !== newVersion) {
    console.log(
      `\n${colors.bold}Version:${colors.reset} ${oldVersion} → ${colors.green}${newVersion}${colors.reset}`
    );
  } else {
    console.log(`\n${colors.bold}Version:${colors.reset} ${newVersion} (no change)`);
  }
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
  const oldVersion = VERSION;

  console.log(`\n${"═".repeat(50)}`);
  console.log(
    `${colors.bold}Agent Scripts Self-Update${colors.reset}${dryRun ? ` ${colors.yellow}(dry run)${colors.reset}` : ""}`
  );
  console.log(`${"═".repeat(50)}`);
  console.log(`Location: ${agentScriptsDir}`);
  console.log(`Current version: ${oldVersion}`);

  // Download and update
  const { newVersion } = await downloadAndUpdate(agentScriptsDir, dryRun);

  // Update dependencies
  if (!skipDeps) {
    await updateDeps(agentScriptsDir, dryRun);
  }

  // Print summary
  printSummary(dryRun, oldVersion, newVersion);
}

main().catch((err) => {
  console.error(`${colors.bold}Error:${colors.reset}`, err.message);
  process.exit(1);
});
