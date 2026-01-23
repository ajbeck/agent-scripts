#!/usr/bin/env bun

/**
 * Setup script to install agent-scripts into a project.
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
  const types = config.types?.length ? config.types : ["Task", "Bug", "Story"];

  const projectSection = config.project
    ? `
## Project Settings

- **Default project**: \`${project}\`
- **Issue types**: ${types.join(", ")}
- **Common JQL**: \`project = ${project} AND status != Done\`
`
    : "";

  return `# Agent Scripts

TypeScript tools for Jira operations. Uses acli's \`--from-json\` pattern internally.

This is a self-contained folder with its own \`package.json\` and \`node_modules\`.
You can add \`agent-scripts/\` to your \`.gitignore\` or commit the source files (node_modules is already ignored).
${projectSection}
## Usage

\`\`\`typescript
import { acli, markdownToAdf } from "./agent-scripts";

// Create workitem with markdown (auto-converts to ADF)
await acli.workitem.create({
  project: "${project}",
  type: "${types[0]}",
  summary: "Task title",
  descriptionMarkdown: "# Heading\\n\\n**bold** text",
  labels: ["feature"],
  customFields: { customfield_10000: { value: "custom" } },
});

// Edit workitem (supports batch editing via key array)
await acli.workitem.edit({
  key: "${project}-123", // or ["${project}-123", "${project}-124"] for batch
  descriptionMarkdown: "Updated description",
  labelsToAdd: ["done"],
  labelsToRemove: ["wip"],
});

// Search and view
const issues = await acli.workitem.search({ jql: "project = ${project}" });
const issue = await acli.workitem.view("${project}-123");

// Add comment
await acli.workitem.comment.create({
  key: "${project}-123",
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

Install agent-scripts tools into a project as a self-contained folder.

Creates:
  <target>/agent-scripts/
    ├── package.json      # Dependencies isolated here
    ├── node_modules/     # Not committed (in .gitignore)
    ├── .gitignore
    ├── tsconfig.json
    ├── index.ts, acli.ts, ...
    └── lib/...

Usage:
  # Remote install (no local clone needed)
  curl -fsSL https://raw.githubusercontent.com/ajbeck/agent-scripts/main/scripts/setup.ts | bun run -

  # Local install
  bun run scripts/setup.ts [options]

Options:
  --target <path>     Target directory (default: current directory)
  --project <key>     Default Jira project key (e.g., MYPROJECT)
  --types <types>     Comma-separated issue types (e.g., Task,Bug,Story)
  --dry-run           Show what would be done without making changes
  --skip-deps         Skip dependency installation
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
  dryRun: boolean
): Promise<void> {
  const files = [
    { name: "package.json", content: generatePackageJson() },
    { name: "tsconfig.json", content: generateTsConfig() },
    { name: ".gitignore", content: generateGitignore() },
  ];

  for (const file of files) {
    const filePath = join(agentScriptsDir, file.name);
    if (dryRun) {
      console.log(`  Would create: ${file.name}`);
    } else {
      await Bun.write(filePath, file.content);
      console.log(`  Created: ${file.name}`);
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
  config: ProjectConfig,
  dryRun: boolean
): Promise<void> {
  const docPath = join(scriptsDir, "AGENT_SCRIPTS.md");
  const content = generateAgentScriptsMd(config);

  if (dryRun) {
    console.log(`  Would create: ${docPath}`);
    if (config.project) {
      console.log(`  With project: ${config.project}`);
      console.log(`  With types: ${config.types?.join(", ") || "Task, Bug, Story"}`);
    }
  } else {
    await Bun.write(docPath, content);
    console.log(`  Created: ${docPath}`);
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

  console.log(`\nAgent Scripts Setup${dryRun ? " (dry run)" : ""}`);
  console.log(`Target: ${agentScriptsDir}`);
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

  // Create agent-scripts directory
  if (!dryRun) {
    await Bun.$`mkdir -p ${agentScriptsDir}`.quiet();
  }

  // Write config files (package.json, tsconfig.json, .gitignore)
  console.log("Creating config files...");
  await writeConfigFiles(agentScriptsDir, dryRun);

  // Get files (local copy or remote download)
  if (runningLocally) {
    const sourceDir = getLocalSourceDir();
    console.log(`\nSource: ${sourceDir}\n`);
    await copyFilesFromLocal(sourceDir, agentScriptsDir, dryRun);
  } else {
    console.log(`\nSource: ${GITHUB_RAW_BASE}\n`);
    await downloadFilesFromGithub(agentScriptsDir, dryRun);
  }

  // Install dependencies inside agent-scripts folder
  if (!skipDeps) {
    console.log("\nInstalling dependencies...");
    await installDeps(agentScriptsDir, dryRun);
  } else {
    console.log("\nSkipping dependency installation (--skip-deps)");
  }

  // Write documentation
  console.log("\nCreating documentation...");
  await writeDocumentation(agentScriptsDir, projectConfig, dryRun);

  // Final instructions
  console.log("\n" + "=".repeat(60));
  console.log("Setup complete!");
  console.log("=".repeat(60));
  console.log(`
Next steps:
1. Add to your CLAUDE.md:
   @${FOLDER_NAME}/AGENT_SCRIPTS.md

2. Import and use:
   import { acli } from "./${FOLDER_NAME}";

3. Or run CLI directly:
   bun run ${FOLDER_NAME}/acli.ts workitem view TEAM-123
`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
