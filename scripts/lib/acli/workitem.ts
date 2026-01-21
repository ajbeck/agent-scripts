/**
 * ACLI Jira Workitem commands
 *
 * Uses the --from-json pattern for create/edit operations to support:
 * - Custom fields via additionalAttributes
 * - Batch editing (multiple issues)
 * - Cleaner ADF handling (object vs stringified)
 *
 * JSON Format Notes (from `acli jira workitem <cmd> --generate-json`):
 * - Templates are command-specific (create vs edit have different fields)
 * - Templates are static placeholders, NOT populated from existing workitems
 * - --generate-json is mutually exclusive with --key/--jql/--filter/--from-json
 *
 * CREATE JSON structure:
 *   { projectKey, type, summary, description (ADF), assignee, labels[], parentIssueId, additionalAttributes }
 *
 * EDIT JSON structure:
 *   { issues[], summary, description (ADF), assignee, type, labelsToAdd[], labelsToRemove[] }
 *   Note: To edit based on current state, first call `workitem view --json` then transform.
 */

import { jiraExec, type AcliResult } from "./base";
import { markdownToAdf, markdownToAdfString } from "../md-to-adf";
import { withTempJson } from "./utils";

export interface WorkitemCreateOptions {
  project: string;
  type: string;
  summary: string;
  description?: string;
  descriptionMarkdown?: string;
  assignee?: string;
  labels?: string[];
  parent?: string;
  customFields?: Record<string, unknown>;
}

export interface WorkitemSearchOptions {
  jql?: string;
  filter?: string;
  fields?: string;
  limit?: number;
  paginate?: boolean;
}

export interface WorkitemEditOptions {
  key: string | string[];
  summary?: string;
  description?: string;
  descriptionMarkdown?: string;
  assignee?: string;
  labelsToAdd?: string[];
  labelsToRemove?: string[];
  type?: string;
  customFields?: Record<string, unknown>;
}

export interface WorkitemTransitionOptions {
  key: string;
  status: string;
}

export interface CommentCreateOptions {
  key: string;
  body?: string;
  bodyMarkdown?: string;
  bodyFile?: string;
}

/**
 * Create a new workitem using --from-json pattern
 */
export async function create<T = unknown>(
  options: WorkitemCreateOptions
): Promise<AcliResult<T>> {
  const payload: Record<string, unknown> = {
    projectKey: options.project,
    type: options.type,
    summary: options.summary,
  };

  if (options.descriptionMarkdown) {
    payload.description = markdownToAdf(options.descriptionMarkdown);
  } else if (options.description) {
    payload.description = options.description;
  }
  if (options.assignee) {
    payload.assignee = options.assignee;
  }
  if (options.labels?.length) {
    payload.labels = options.labels;
  }
  if (options.parent) {
    payload.parentIssueId = options.parent;
  }
  if (options.customFields) {
    payload.additionalAttributes = options.customFields;
  }

  return withTempJson(payload, (path) =>
    jiraExec<T>("workitem create", ["--from-json", path])
  );
}

/**
 * View a workitem by key
 */
export async function view<T = unknown>(
  key: string,
  fields?: string
): Promise<AcliResult<T>> {
  const args = [key];
  if (fields) {
    args.push("--fields", fields);
  }
  return jiraExec<T>("workitem view", args);
}

/**
 * Search workitems
 */
export async function search<T = unknown>(
  options: WorkitemSearchOptions
): Promise<AcliResult<T>> {
  const args: string[] = [];

  if (options.jql) {
    args.push("--jql", options.jql);
  }
  if (options.filter) {
    args.push("--filter", options.filter);
  }
  if (options.fields) {
    args.push("--fields", options.fields);
  }
  if (options.limit) {
    args.push("--limit", String(options.limit));
  }
  if (options.paginate) {
    args.push("--paginate");
  }

  return jiraExec<T>("workitem search", args);
}

/**
 * Edit a workitem using --from-json pattern
 *
 * Supports batch editing by passing an array of keys.
 */
export async function edit<T = unknown>(
  options: WorkitemEditOptions
): Promise<AcliResult<T>> {
  const issues = Array.isArray(options.key) ? options.key : [options.key];

  const payload: Record<string, unknown> = { issues };

  if (options.summary) {
    payload.summary = options.summary;
  }
  if (options.descriptionMarkdown) {
    payload.description = markdownToAdf(options.descriptionMarkdown);
  } else if (options.description) {
    payload.description = options.description;
  }
  if (options.assignee) {
    payload.assignee = options.assignee;
  }
  if (options.labelsToAdd?.length) {
    payload.labelsToAdd = options.labelsToAdd;
  }
  if (options.labelsToRemove?.length) {
    payload.labelsToRemove = options.labelsToRemove;
  }
  if (options.type) {
    payload.type = options.type;
  }
  if (options.customFields) {
    payload.additionalAttributes = options.customFields;
  }

  return withTempJson(payload, (path) =>
    jiraExec<T>("workitem edit", ["--from-json", path, "--yes"])
  );
}

/**
 * Transition a workitem to a new status
 */
export async function transition<T = unknown>(
  options: WorkitemTransitionOptions
): Promise<AcliResult<T>> {
  return jiraExec<T>("workitem transition", [
    "--key", options.key,
    "--status", options.status,
    "--yes",
  ]);
}

/**
 * Comment commands
 */
export const comment = {
  /**
   * Create a comment on a workitem
   */
  async create<T = unknown>(
    options: CommentCreateOptions
  ): Promise<AcliResult<T>> {
    const args = ["--key", options.key];

    if (options.bodyMarkdown) {
      args.push("--body", markdownToAdfString(options.bodyMarkdown));
    } else if (options.body) {
      args.push("--body", options.body);
    }
    if (options.bodyFile) {
      args.push("--body-file", options.bodyFile);
    }

    return jiraExec<T>("workitem comment create", args);
  },
};
