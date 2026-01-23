#!/usr/bin/env bun

/**
 * Setup script to install or update agent-scripts in a project.
 *
 * Can be re-run to update an existing installation - will overwrite files
 * while preserving node_modules.
 *
 * Usage (remote - no local clone needed):
 *   curl -fsSL https://raw.githubusercontent.com/ajbeck/agent-scripts/main/scripts/setup.ts | bun run -
 *
 * Usage (local):
 *   bun run scripts/setup.ts
 *   bun run scripts/setup.ts --target /other/project
 *
 * Options:
 *   --target <path>     Target directory (default: current directory)
 *   --project <key>     Default Jira project key (e.g., MYPROJECT)
 *   --types <types>     Comma-separated issue types (e.g., Task,Bug,Story)
 *   --dry-run           Show what would be done without making changes
 *   --skip-deps         Skip dependency installation
 */

import { join, dirname, resolve } from "path";
import { existsSync } from "fs";

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/ajbeck/agent-scripts/main";

const FOLDER_NAME = "agent-scripts";

const DEPENDENCIES = [
  "@atlaskit/adf-schema",
  "@atlaskit/editor-json-transformer",
  "@atlaskit/editor-markdown-transformer",
  "ajv",
  "ajv-formats",
];

const FILES_TO_DOWNLOAD = [
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

const SKILLS_TO_INSTALL = [
  "skills/acli-jira/SKILL.md",
  "skills/peekaboo-macos/SKILL.md",
];

/**
 * Generate package.json for the self-contained agent-scripts folder
 */
function generatePackageJson(): string {
  const pkg = {
    name: "agent-scripts",
    version: "1.0.0",
    private: true,
    type: "module",
  };
  return JSON.stringify(pkg, null, 2);
}

/**
 * Generate tsconfig.json for TypeScript resolution
 */
function generateTsConfig(): string {
  const config = {
    compilerOptions: {
      target: "ESNext",
      module: "ESNext",
      moduleResolution: "bundler",
      esModuleInterop: true,
      strict: true,
      skipLibCheck: true,
      types: ["bun-types"],
    },
  };
  return JSON.stringify(config, null, 2);
}

/**
 * Generate .gitignore for the agent-scripts folder
 */
function generateGitignore(): string {
  return `node_modules/
`
;
}

interface ProjectConfig {
  project?: string;
  types?: string[];
}

function generateAgentScriptsMd(config: ProjectConfig): string {
  const project = config.project || "PROJECT_KEY";

  const projectSection = config.project
    ? `
## Project Settings

- **Default project**: \`${project}\`
- **Common JQL**: \`project = ${project} AND status != Done\`
`
    : "";

  return `# Agent Scripts

TypeScript interfaces for automation. Import from \`./agent-scripts\`:

\`\`\`typescript
import { acli, peekaboo, markdownToAdf } from "./agent-scripts";
\`\`\`

| Tool            | Purpose                                           | Source                          |
| --------------- | ------------------------------------------------- | ------------------------------- |
| \`acli\`          | Jira workitems, projects, boards                  | \`agent-scripts/lib/acli/\`       |
| \`peekaboo\`      | macOS UI automation (screenshots, clicks, typing) | \`agent-scripts/lib/peekaboo/\`   |
| \`markdownToAdf\` | Convert markdown to Atlassian Document Format     | \`agent-scripts/lib/md-to-adf.ts\` |
${projectSection}
## acli - Jira

\`\`\`typescript
// Search and view
const issues = await acli.workitem.search({ jql: "project = ${project}" });
const issue = await acli.workitem.view("${project}-123");

// Create/edit (use descriptionMarkdown for auto-conversion)
await acli.workitem.create({
  project: "${project}",
  type: "Task",
  summary: "Title",
  descriptionMarkdown: "# Desc",
});
await acli.workitem.edit({ key: "${project}-123", descriptionMarkdown: "Updated" });

// Comments and transitions
await acli.workitem.comment.create({ key: "${project}-123", bodyMarkdown: "Comment text" });
await acli.workitem.transition({ key: "${project}-123", status: "Done" });
\`\`\`

## peekaboo - macOS Automation

\`\`\`typescript
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
\`\`\`

**For full APIs, read the TypeScript source files or use the skills in \`.claude/skills/\`.**

## Updating

To update to the latest version from GitHub:

\`\`\`sh
bun run agent-scripts/selfUpdate.ts
\`\`\`

Use \`--dry-run\` to preview changes without applying them.
`;
}

function printHelp() {
  console.log(`
agent-scripts setup

Install or update agent-scripts tools in a project.

Can be re-run to update an existing installation - will overwrite source files
while preserving node_modules.

Creates/Updates:
  <target>/agent-scripts/
    ├── package.json      # Dependencies isolated here
    ├── node_modules/     # Not committed (in .gitignore)
    ├── .gitignore
    ├── tsconfig.json
    ├── index.ts, acli.ts, ...
    └── lib/...
  <target>/.claude/skills/
    ├── acli-jira/SKILL.md
    └── peekaboo-macos/SKILL.md

Usage:
  # Remote install/update (no local clone needed)
  curl -fsSL https://raw.githubusercontent.com/ajbeck/agent-scripts/main/scripts/setup.ts | bun run -

  # Local install/update
  bun run scripts/setup.ts [options]

Options:
  --target <path>     Target directory (default: current directory)
  --project <key>     Default Jira project key (e.g., MYPROJECT)
  --types <types>     Comma-separated issue types (e.g., Task,Bug,Story)
  --dry-run           Show what would be done without making changes
  --skip-deps         Skip dependency installation/update
  --help, -h          Show this help message

Examples:
  bun run setup.ts                                    # Install to current directory
  bun run setup.ts --project MYPROJ --types Task,Bug  # With project config
  bun run setup.ts --target /path/to/proj             # Install to specific directory
  bun run setup.ts --dry-run                          # Preview changes
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
 * Write config files (package.json, tsconfig.json, .gitignore) inside agent-scripts folder
 */
async function writeConfigFiles(
  agentScriptsDir: string,
  dryRun: boolean,
  isUpdate: boolean = false
): Promise<void> {
  const files = [
    { name: "package.json", content: generatePackageJson() },
    { name: "tsconfig.json", content: generateTsConfig() },
    { name: ".gitignore", content: generateGitignore() },
  ];

  const verb = isUpdate ? "Updated" : "Created";
  const wouldVerb = isUpdate ? "Would update" : "Would create";

  for (const file of files) {
    const filePath = join(agentScriptsDir, file.name);
    if (dryRun) {
      console.log(`  ${wouldVerb}: ${file.name}`);
    } else {
      await Bun.write(filePath, file.content);
      console.log(`  ${verb}: ${file.name}`);
    }
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
  for (const file of ["index.ts", "md-to-adf.ts", "acli.ts", "validate-workflow.ts", "selfUpdate.ts"]) {
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
 * Copy skills from local source to target's .claude/skills/
 */
async function copySkillsFromLocal(
  sourceDir: string,
  targetDir: string,
  dryRun: boolean,
  isUpdate: boolean = false
): Promise<void> {
  const skillsTargetDir = join(targetDir, ".claude/skills");
  const verb = isUpdate ? "Updating" : "Installing";
  const pastVerb = isUpdate ? "Updated" : "Installed";

  console.log(`${verb} skills to .claude/skills/...`);

  for (const skillPath of SKILLS_TO_INSTALL) {
    const skillName = skillPath.split("/")[1]; // e.g., "acli-jira"
    const srcPath = join(sourceDir, skillPath);
    const destDir = join(skillsTargetDir, skillName);
    const destPath = join(destDir, "SKILL.md");

    if (dryRun) {
      console.log(`  Would ${isUpdate ? "update" : "copy"}: ${skillPath}`);
    } else {
      await Bun.$`mkdir -p ${destDir}`.quiet();
      await Bun.$`cp ${srcPath} ${destPath}`.quiet();
      console.log(`  ${pastVerb}: ${skillName}`);
    }
  }
}

/**
 * Download skills from GitHub to target's .claude/skills/
 */
async function downloadSkillsFromGithub(
  targetDir: string,
  dryRun: boolean,
  isUpdate: boolean = false
): Promise<void> {
  const skillsTargetDir = join(targetDir, ".claude/skills");
  const verb = isUpdate ? "Updating" : "Downloading";
  const pastVerb = isUpdate ? "Updated" : "Installed";

  console.log(`${verb} skills from GitHub...`);

  for (const skillPath of SKILLS_TO_INSTALL) {
    const skillName = skillPath.split("/")[1]; // e.g., "acli-jira"
    const destDir = join(skillsTargetDir, skillName);
    const destPath = join(destDir, "SKILL.md");

    if (dryRun) {
      console.log(`  Would ${isUpdate ? "update" : "download"}: ${skillPath}`);
    } else {
      console.log(`  ${verb}: ${skillPath}`);
      await Bun.$`mkdir -p ${destDir}`.quiet();
      const content = await downloadFile(skillPath);
      await Bun.write(destPath, content);
      console.log(`  ${pastVerb}: ${skillName}`);
    }
  }
}

/**
 * Install or update dependencies
 */
async function installDeps(
  targetDir: string,
  dryRun: boolean,
  isUpdate: boolean = false
): Promise<void> {
  const deps = DEPENDENCIES.join(" ");
  const verb = isUpdate ? "Updating" : "Installing";

  if (dryRun) {
    console.log(`  Would run: bun add ${deps}`);
    return;
  }
  console.log(`  ${verb}: ${deps}`);
  await Bun.$`cd ${targetDir} && bun add ${DEPENDENCIES}`.quiet();
  console.log(`  Dependencies ${isUpdate ? "updated" : "installed"}`);
}

/**
 * Write AGENT_SCRIPTS.md documentation file
 */
async function writeDocumentation(
  scriptsDir: string,
  config: ProjectConfig,
  dryRun: boolean,
  isUpdate: boolean = false
): Promise<void> {
  const docPath = join(scriptsDir, "AGENT_SCRIPTS.md");
  const content = generateAgentScriptsMd(config);
  const verb = isUpdate ? "Updated" : "Created";
  const wouldVerb = isUpdate ? "Would update" : "Would create";

  if (dryRun) {
    console.log(`  ${wouldVerb}: ${docPath}`);
    if (config.project) {
      console.log(`  With project: ${config.project}`);
      console.log(`  With types: ${config.types?.join(", ") || "Task, Bug, Story"}`);
    }
  } else {
    await Bun.write(docPath, content);
    console.log(`  ${verb}: ${docPath}`);
  }
}

function getArgValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : undefined;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  // Parse arguments
  const targetDir = getArgValue(args, "--target") || ".";
  const project = getArgValue(args, "--project");
  const typesArg = getArgValue(args, "--types");
  const types = typesArg ? typesArg.split(",").map((t) => t.trim()) : undefined;
  const dryRun = args.includes("--dry-run");
  const skipDeps = args.includes("--skip-deps");

  const projectConfig: ProjectConfig = { project, types };

  const absTargetDir = resolve(targetDir);
  const agentScriptsDir = join(absTargetDir, FOLDER_NAME);
  const runningLocally = isRunningLocally();

  // Detect if this is an update (agent-scripts folder already exists)
  const isUpdate = existsSync(agentScriptsDir);
  const action = isUpdate ? "Update" : "Setup";
  const actionVerb = isUpdate ? "Updating" : "Installing";
  const actionPast = isUpdate ? "Updated" : "Installed";

  console.log(`\nAgent Scripts ${action}${dryRun ? " (dry run)" : ""}`);
  console.log(`Target: ${agentScriptsDir}`);
  console.log(`Mode: ${runningLocally ? "local" : "remote"}`);
  if (isUpdate) {
    console.log(`Status: Updating existing installation`);
  }
  console.log();

  // Ensure target directory exists
  if (!existsSync(absTargetDir)) {
    if (dryRun) {
      console.log(`Would create directory: ${absTargetDir}`);
    } else {
      await Bun.$`mkdir -p ${absTargetDir}`.quiet();
      console.log(`Created directory: ${absTargetDir}`);
    }
  }

  // Create agent-scripts directory
  if (!dryRun) {
    await Bun.$`mkdir -p ${agentScriptsDir}`.quiet();
  }

  // Write config files (package.json, tsconfig.json, .gitignore)
  console.log(`${actionVerb} config files...`);
  await writeConfigFiles(agentScriptsDir, dryRun, isUpdate);

  // Get files (local copy or remote download)
  if (runningLocally) {
    const sourceDir = getLocalSourceDir();
    console.log(`\nSource: ${sourceDir}\n`);
    await copyFilesFromLocal(sourceDir, agentScriptsDir, dryRun);
    await copySkillsFromLocal(sourceDir, absTargetDir, dryRun, isUpdate);
  } else {
    console.log(`\nSource: ${GITHUB_RAW_BASE}\n`);
    await downloadFilesFromGithub(agentScriptsDir, dryRun);
    await downloadSkillsFromGithub(absTargetDir, dryRun, isUpdate);
  }

  // Install/update dependencies inside agent-scripts folder
  if (!skipDeps) {
    console.log(`\n${actionVerb} dependencies...`);
    await installDeps(agentScriptsDir, dryRun, isUpdate);
  } else {
    console.log(`\nSkipping dependency ${isUpdate ? "update" : "installation"} (--skip-deps)`);
  }

  // Write documentation
  console.log(`\n${actionVerb} documentation...`);
  await writeDocumentation(agentScriptsDir, projectConfig, dryRun, isUpdate);

  // Final instructions
  console.log("\n" + "=".repeat(60));
  console.log(`${action} complete!`);
  console.log("=".repeat(60));

  if (isUpdate) {
    console.log(`
${actionPast}:
  ${FOLDER_NAME}/           TypeScript libraries
  .claude/skills/       On-demand documentation (acli-jira, peekaboo-macos)

All source files have been updated. node_modules preserved.
`);
  } else {
    console.log(`
${actionPast}:
  ${FOLDER_NAME}/           TypeScript libraries
  .claude/skills/       On-demand documentation (acli-jira, peekaboo-macos)

Next steps:
1. Add to your CLAUDE.md:
   @${FOLDER_NAME}/AGENT_SCRIPTS.md

2. Import and use:
   import { acli, peekaboo } from "./${FOLDER_NAME}";

3. Skills load automatically when Claude needs detailed API reference.
`);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
