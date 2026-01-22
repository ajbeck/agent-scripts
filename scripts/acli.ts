#!/usr/bin/env bun

/**
 * ACLI CLI - Command-line interface for Jira operations
 *
 * Usage:
 *   ./scripts/acli.ts workitem view KEY-123
 *   ./scripts/acli.ts workitem search --jql "project = PROJ"
 *   ./scripts/acli.ts workitem create --project PROJ --type Task --summary "Title"
 */

import { acli } from "./lib";

function printHelp() {
  console.log(`
acli - Jira CLI wrapper

Usage:
  acli.ts <command> [options]

Commands:
  workitem view <key>           View a workitem
  workitem search               Search workitems
  workitem create               Create a workitem
  workitem edit                 Edit a workitem

Options:
  --help, -h                    Show this help

Examples:
  acli.ts workitem view DUCK-123
  acli.ts workitem search --jql "project = DUCK"
  acli.ts workitem create --project DUCK --type Task --summary "New task"
`);
}

function getArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : undefined;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  const [resource, command, ...rest] = args;

  if (resource === "workitem") {
    if (command === "view") {
      const key = rest[0] || getArg(rest, "--key");
      if (!key) {
        console.error("Error: workitem key required");
        process.exit(1);
      }
      const result = await acli.workitem.view(key);
      console.log(JSON.stringify(result.data, null, 2));
    } else if (command === "search") {
      const jql = getArg(rest, "--jql");
      const limit = getArg(rest, "--limit");
      const result = await acli.workitem.search({
        jql,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
      console.log(JSON.stringify(result.data, null, 2));
    } else if (command === "create") {
      const project = getArg(rest, "--project");
      const type = getArg(rest, "--type");
      const summary = getArg(rest, "--summary");
      const description = getArg(rest, "--description");
      if (!project || !type || !summary) {
        console.error("Error: --project, --type, and --summary required");
        process.exit(1);
      }
      const result = await acli.workitem.create({
        project,
        type,
        summary,
        descriptionMarkdown: description,
      });
      console.log(JSON.stringify(result.data, null, 2));
    } else if (command === "edit") {
      const key = getArg(rest, "--key");
      const summary = getArg(rest, "--summary");
      const description = getArg(rest, "--description");
      if (!key) {
        console.error("Error: --key required");
        process.exit(1);
      }
      const result = await acli.workitem.edit({
        key,
        summary,
        descriptionMarkdown: description,
      });
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.error(`Unknown command: workitem ${command}`);
      process.exit(1);
    }
  } else {
    console.error(`Unknown resource: ${resource}`);
    printHelp();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
