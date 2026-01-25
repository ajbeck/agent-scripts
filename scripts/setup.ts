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
 */

import { join, resolve, dirname } from "path";
import { existsSync } from "fs";

// Try to import version locally, fallback to placeholder if running from stdin
let VERSION = "latest";
try {
  const versionModule = await import("./version.ts");
  VERSION = versionModule.VERSION;
} catch {
  // Running from stdin (curl | bun), version will be read from downloaded files
}

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
function addSkillFrontMatter(content: string): string {
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
          .replace(/version:.*/, `version: "${VERSION}"`)
          .replace(/source:.*/, `source: agent-scripts`);
        return `---\n${updatedFrontMatter}\n---${body}`;
      }

      // Add source and version to existing front matter
      const newFrontMatter = `${frontMatter}\nsource: agent-scripts\nversion: "${VERSION}"`;
      return `---\n${newFrontMatter}\n---${body}`;
    }
  }

  // No front matter, shouldn't happen for SKILL.md files
  return content;
}

function generatePackageJson(): string {
  return JSON.stringify(
    {
      name: "agent-scripts",
      version: VERSION,
      private: true,
      type: "module",
    },
    null,
    2
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
    2
  );
}

function generateRulesFile(): string {
  return `# Agent Scripts (v${VERSION})

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

function generateAgentScriptsMd(project: string): string {
  const projectSection =
    project !== "PROJECT_KEY"
      ? `
## Project Settings

- **Default project**: \`${project}\`
- **Common JQL**: \`project = ${project} AND status != Done\`
`
      : "";

  return `# Agent Scripts v${VERSION}

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
${colors.bold}agent-scripts setup v${VERSION}${colors.reset}

Install or update agent-scripts tools in a project.
Downloads from GitHub - no local clone needed.

${colors.bold}Creates/Updates:${colors.reset}
  <target>/agent-scripts/
    ├── lib/              # All libraries with docs/ and manifest.json
    ├── config/           # Configuration files
    ├── package.json
    └── ...
  <target>/.claude/rules/
    └── agent-scripts.md  # Auto-loaded instructions
  <target>/.claude/skills/
    └── (all skills)

${colors.bold}Usage:${colors.reset}
  curl -fsSL https://raw.githubusercontent.com/${GITHUB_REPO}/main/scripts/setup.ts | bun run -
  bun run scripts/setup.ts --target /path/to/project

${colors.bold}Options:${colors.reset}
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
  dryRun: boolean
): Promise<void> {
  const tarballUrl = `https://github.com/${GITHUB_REPO}/archive/refs/heads/${GITHUB_BRANCH}.tar.gz`;
  const tempDir = join(targetDir, ".agent-scripts-temp");

  console.log(`\n${colors.bold}Downloading from GitHub...${colors.reset}`);
  console.log(`  ${colors.gray}${tarballUrl}${colors.reset}`);

  if (dryRun) {
    console.log(`\n${colors.yellow}[dry-run] Would download and extract files${colors.reset}`);
    return;
  }

  try {
    // Download and extract
    await Bun.$`mkdir -p ${tempDir}`.quiet();
    await Bun.$`curl -sL ${tarballUrl} | tar -xz -C ${tempDir} --strip-components=1`.quiet();
    console.log(`  ${colors.green}✓${colors.reset} Downloaded and extracted\n`);

    // Read version from downloaded files if not available locally
    if (VERSION === "latest") {
      const versionFile = join(tempDir, "scripts/version.ts");
      if (existsSync(versionFile)) {
        const content = await Bun.file(versionFile).text();
        const match = content.match(/VERSION\s*=\s*"([^"]+)"/);
        if (match) {
          VERSION = match[1];
          console.log(`  ${colors.gray}Version: ${VERSION}${colors.reset}\n`);
        }
      }
    }

    // Copy directories with file-level tracking
    for (const { src, dest } of DIRECTORIES_TO_COPY) {
      const srcPath = join(tempDir, src);
      const destPath = join(agentScriptsDir, dest);

      console.log(`${colors.bold}${dest}/${colors.reset}`);
      await Bun.$`mkdir -p ${destPath}`.quiet();

      // Walk directory and copy files individually
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

    // Copy all skills with version stamping
    console.log(`\n${colors.bold}.claude/skills/${colors.reset}`);
    const skillsSrcDir = join(tempDir, "skills");
    const skillsDestDir = join(targetDir, ".claude/skills");
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
          const versionedContent = addSkillFrontMatter(content);
          await writeTracked(skillMdDest, versionedContent, `${skill}/SKILL.md`);
        }
      }
    }

    // Create rules file
    console.log(`\n${colors.bold}.claude/rules/${colors.reset}`);
    const rulesDir = join(targetDir, ".claude/rules");
    await Bun.$`mkdir -p ${rulesDir}`.quiet();
    await writeTracked(
      join(rulesDir, "agent-scripts.md"),
      generateRulesFile(),
      "agent-scripts.md"
    );
  } finally {
    await Bun.$`rm -rf ${tempDir}`.quiet().nothrow();
  }
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

async function writeConfigFiles(
  agentScriptsDir: string,
  dryRun: boolean
): Promise<void> {
  console.log(`\n${colors.bold}Config files${colors.reset}`);

  const files = [
    { name: "package.json", content: generatePackageJson() },
    { name: "tsconfig.json", content: generateTsConfig() },
    { name: ".gitignore", content: "node_modules/\n" },
  ];

  if (dryRun) {
    for (const { name } of files) {
      console.log(`  ${colors.yellow}[dry-run]${colors.reset} ${name}`);
    }
    return;
  }

  for (const { name, content } of files) {
    await writeTracked(join(agentScriptsDir, name), content, name);
  }
}

async function installDeps(dir: string, dryRun: boolean): Promise<void> {
  console.log(`\n${colors.bold}Dependencies${colors.reset}`);

  if (dryRun) {
    console.log(`  ${colors.yellow}[dry-run]${colors.reset} Would install: ${DEPENDENCIES.join(", ")}`);
    return;
  }

  console.log(`  ${colors.gray}Installing: ${DEPENDENCIES.join(", ")}${colors.reset}`);
  await Bun.$`cd ${dir} && bun add ${DEPENDENCIES}`.quiet();
  console.log(`  ${colors.green}✓${colors.reset} Dependencies installed`);
}

function printSummary(dryRun: boolean) {
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

  console.log(`\n${colors.bold}Version:${colors.reset} ${VERSION}`);
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

  console.log(`\n${"═".repeat(50)}`);
  console.log(`${colors.bold}Agent Scripts ${isUpdate ? "Update" : "Setup"} v${VERSION}${colors.reset}${dryRun ? ` ${colors.yellow}(dry run)${colors.reset}` : ""}`);
  console.log(`${"═".repeat(50)}`);
  console.log(`Target: ${agentScriptsDir}`);

  // Create directories
  if (!dryRun) {
    await Bun.$`mkdir -p ${agentScriptsDir}`.quiet();
  }

  // Write config files
  await writeConfigFiles(agentScriptsDir, dryRun);

  // Download and copy files
  await downloadAndExtract(agentScriptsDir, targetDir, dryRun);

  // Install dependencies
  if (!skipDeps) {
    await installDeps(agentScriptsDir, dryRun);
  }

  // Write documentation
  console.log(`\n${colors.bold}Documentation${colors.reset}`);
  const docPath = join(agentScriptsDir, "AGENT_SCRIPTS.md");
  if (!dryRun) {
    await writeTracked(docPath, generateAgentScriptsMd(project), "AGENT_SCRIPTS.md");
  } else {
    console.log(`  ${colors.yellow}[dry-run]${colors.reset} AGENT_SCRIPTS.md`);
  }

  // Print summary
  printSummary(dryRun);

  console.log(`
${colors.bold}Usage:${colors.reset}
  import { acli, peekaboo, chrome } from "./${FOLDER_NAME}";

Claude Code will automatically discover the tools and skills.
No changes to CLAUDE.md required.
`);
}

main().catch((err) => {
  console.error(`${colors.bold}Error:${colors.reset}`, err.message);
  process.exit(1);
});
