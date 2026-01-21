/**
 * ACLI Jira Board commands
 */

import { jiraExec, type AcliResult } from "./base";

export interface BoardSearchOptions {
  name?: string;
  project?: string;
}

/**
 * Search boards
 */
export async function search<T = unknown>(
  options: BoardSearchOptions = {}
): Promise<AcliResult<T>> {
  const args: string[] = [];
  if (options.name) {
    args.push("--name", options.name);
  }
  if (options.project) {
    args.push("--project", options.project);
  }
  return jiraExec<T>("board search", args);
}

/**
 * List sprints for a board
 */
export async function listSprints<T = unknown>(
  boardId: string | number
): Promise<AcliResult<T>> {
  return jiraExec<T>("board list-sprints", [String(boardId)]);
}

/**
 * Get board details
 */
export async function get<T = unknown>(
  boardId: string | number
): Promise<AcliResult<T>> {
  return jiraExec<T>("board get", [String(boardId)]);
}
