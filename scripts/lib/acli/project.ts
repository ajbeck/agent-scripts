/**
 * ACLI Jira Project commands
 */

import { jiraExec, type AcliResult } from "./base";

export interface ProjectListOptions {
  recent?: boolean;
  limit?: number;
  paginate?: boolean;
}

/**
 * List projects (requires one of: recent, limit, or paginate)
 */
export async function list<T = unknown>(
  options: ProjectListOptions = { recent: true }
): Promise<AcliResult<T>> {
  const args: string[] = [];
  if (options.recent) {
    args.push("--recent");
  }
  if (options.limit) {
    args.push("--limit", String(options.limit));
  }
  if (options.paginate) {
    args.push("--paginate");
  }
  return jiraExec<T>("project list", args);
}

/**
 * View a project by key
 */
export async function view<T = unknown>(
  key: string
): Promise<AcliResult<T>> {
  return jiraExec<T>("project view", [key]);
}
