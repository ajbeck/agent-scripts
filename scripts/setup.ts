#!/usr/bin/env bun

/**
 * Setup script to install agent-scripts into another project.
 *
 * Usage:
 *   bun run scripts/setup.ts --target /path/to/project
 *   bun run scripts/setup.ts --target . --dry-run
 *   bun run scripts/setup.ts --target . --skip-deps
 */

import { join, dirname, resolve } from "path";

const DEPENDENCIES = [
  "@atlaskit/adf-schema",
  "@atlaskit/editor-json-transformer",
  "@atlaskit/editor-markdown-transformer",
];

const CLAUDE_MD_SNIPPET = `
## Agent Scripts

TypeScript tools are available in \`scripts/\`. Import and use them in code:

\`\`\`typescript
import { acli, markdownToAdf } from "./scripts";

// Jira operations with markdown support
await acli.workitem.create({
  project: "PROJECT_KEY",
  type: "Task",
  summary: "Task title",
  descriptionMarkdown: "Markdown content here",
});

// Direct markdown to ADF conversion
const adf = markdownToAdf("# Heading\\n\\n**bold**");
\`\`\`

### Available Functions

- \`acli.workitem.create()\` - Create Jira issues (supports \`descriptionMarkdown\`)
- \`acli.workitem.edit()\` - Edit issues (supports \`descriptionMarkdown\`)
- \`acli.workitem.search()\` - Search with JQL
- \`acli.workitem.view()\` - Get issue details
- \`acli.workitem.transition()\` - Change issue status
- \`acli.workitem.comment.create()\` - Add comments (supports \`bodyMarkdown\`)
- \`acli.project.list()\` - List projects
- \`acli.board.search()\` - Search boards
- \`markdownToAdf()\` - Convert markdown string to ADF object
`;

function printHelp() {
  console.log(`
agent-scripts setup

Install agent-scripts tools into another project.

Usage:
  bun run scripts/setup.ts --target <path> [options]

Options:
  --target <path>   Target project directory (required)
  --dry-run         Show what would be done without making changes
  --skip-deps       Skip dependency installation
  --help, -h        Show this help message

Examples:
  bun run scripts/setup.ts --target /path/to/my-project
  bun run scripts/setup.ts --target . --dry-run
`);
}

async function copyDir(src: string, dest: string, dryRun: boolean) {
  if (dryRun) {
    console.log(`  Would copy: ${src} -> ${dest}`);
    return;
  }
  await Bun.$`cp -r ${src} ${dest}`.quiet();
  console.log(`  Copied: ${src} -> ${dest}`);
}

async function copyFile(src: string, dest: string, dryRun: boolean) {
  if (dryRun) {
    console.log(`  Would copy: ${src} -> ${dest}`);
    return;
  }
  await Bun.$`cp ${src} ${dest}`.quiet();
  console.log(`  Copied: ${src} -> ${dest}`);
}

async function installDeps(targetDir: string, dryRun: boolean) {
  const deps = DEPENDENCIES.join(" ");
  if (dryRun) {
    console.log(`  Would run: bun add ${deps}`);
    return;
  }
  console.log(`  Installing: ${deps}`);
  await Bun.$`cd ${targetDir} && bun add ${DEPENDENCIES}`.quiet();
  console.log(`  Dependencies installed`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    printHelp();
    process.exit(0);
  }

  const targetIndex = args.indexOf("--target");
  if (targetIndex === -1 || !args[targetIndex + 1]) {
    console.error("Error: --target <path> is required");
    process.exit(1);
  }

  const targetDir = args[targetIndex + 1];
  const dryRun = args.includes("--dry-run");
  const skipDeps = args.includes("--skip-deps");

  // Resolve paths
  const scriptDir = dirname(import.meta.path);
  const sourceDir = dirname(scriptDir); // agent-scripts root
  const absTargetDir = resolve(targetDir);

  console.log(`\nAgent Scripts Setup${dryRun ? " (dry run)" : ""}`);
  console.log(`Source: ${sourceDir}`);
  console.log(`Target: ${absTargetDir}\n`);

  // Check target exists
  const targetExists = await Bun.file(join(absTargetDir, "package.json")).exists();
  if (!targetExists) {
    console.error(`Error: No package.json found in ${absTargetDir}`);
    console.error("Make sure the target is a valid project directory.");
    process.exit(1);
  }

  // Create scripts directory if needed
  const scriptsDir = join(absTargetDir, "scripts");
  if (!dryRun) {
    await Bun.$`mkdir -p ${scriptsDir}`.quiet();
  }

  // Copy lib folder
  console.log("Copying scripts/lib/...");
  await copyDir(join(sourceDir, "scripts/lib"), join(scriptsDir, "lib"), dryRun);

  // Copy md-to-adf.ts
  console.log("Copying scripts/md-to-adf.ts...");
  await copyFile(
    join(sourceDir, "scripts/md-to-adf.ts"),
    join(scriptsDir, "md-to-adf.ts"),
    dryRun
  );

  // Copy index.ts (top-level export)
  console.log("Copying scripts/index.ts...");
  await copyFile(
    join(sourceDir, "scripts/index.ts"),
    join(scriptsDir, "index.ts"),
    dryRun
  );

  // Install dependencies
  if (!skipDeps) {
    console.log("\nInstalling dependencies...");
    await installDeps(absTargetDir, dryRun);
  } else {
    console.log("\nSkipping dependency installation (--skip-deps)");
  }

  // Output CLAUDE.md snippet
  console.log("\n" + "=".repeat(60));
  console.log("Add the following to your CLAUDE.md:");
  console.log("=".repeat(60));
  console.log(CLAUDE_MD_SNIPPET);
  console.log("=".repeat(60));

  if (!dryRun) {
    // Write snippet to file for easy copying
    const snippetPath = join(absTargetDir, "CLAUDE_SNIPPET.md");
    await Bun.write(snippetPath, CLAUDE_MD_SNIPPET);
    console.log(`\nSnippet saved to: ${snippetPath}`);
    console.log("Copy the contents to your CLAUDE.md, then delete the snippet file.");
  }

  console.log("\nSetup complete!");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
