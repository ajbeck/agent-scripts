/**
 * GitHub workflow commands (gh workflow).
 */

import { ghExec, ghRaw, type GhResult } from "./base";
import type { Workflow, WorkflowRunOptions } from "./types";

/**
 * List workflows in the repository.
 */
export async function list(all?: boolean): Promise<GhResult<Workflow[]>> {
  const args = ["workflow", "list", "--json=id,name,path,state"];
  if (all) args.push("--all");
  return ghExec<Workflow[]>(args);
}

/**
 * View workflow summary.
 */
export async function view(
  workflow: string | number,
  ref?: string
): Promise<GhResult<string>> {
  const args = ["workflow", "view", String(workflow)];
  if (ref) args.push("--ref", ref);
  return ghRaw(args);
}

/**
 * Get workflow YAML content.
 */
export async function viewYaml(
  workflow: string | number,
  ref?: string
): Promise<GhResult<string>> {
  const args = ["workflow", "view", String(workflow), "--yaml"];
  if (ref) args.push("--ref", ref);
  return ghRaw(args);
}

/**
 * Trigger a workflow_dispatch event.
 */
export async function run(
  workflow: string | number,
  options?: WorkflowRunOptions
): Promise<GhResult<void>> {
  const args = ["workflow", "run", String(workflow)];

  if (options?.ref) {
    args.push("--ref", options.ref);
  }

  if (options?.inputs) {
    for (const [key, value] of Object.entries(options.inputs)) {
      args.push("-f", `${key}=${value}`);
    }
  }

  return ghExec<void>(args);
}
