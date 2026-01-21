/**
 * ACLI Jira Workitem commands
 */

import { jiraExec, type AcliResult } from "./base";
import { markdownToAdfString } from "../md-to-adf";

export interface WorkitemCreateOptions {
  project: string;
  type: string;
  summary: string;
  description?: string;
  descriptionMarkdown?: string;
  descriptionFile?: string;
  assignee?: string;
  labels?: string[];
  parent?: string;
}

export interface WorkitemSearchOptions {
  jql?: string;
  filter?: string;
  fields?: string;
  limit?: number;
  paginate?: boolean;
}

export interface WorkitemEditOptions {
  key: string;
  summary?: string;
  description?: string;
  descriptionMarkdown?: string;
  descriptionFile?: string;
  assignee?: string;
  labels?: string;
  type?: string;
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
 * Create a new workitem
 */
export async function create<T = unknown>(
  options: WorkitemCreateOptions
): Promise<AcliResult<T>> {
  const args: string[] = [
    "--project", options.project,
    "--type", options.type,
    "--summary", options.summary,
  ];

  if (options.descriptionMarkdown) {
    args.push("--description", markdownToAdfString(options.descriptionMarkdown));
  } else if (options.description) {
    args.push("--description", options.description);
  }
  if (options.descriptionFile) {
    args.push("--description-file", options.descriptionFile);
  }
  if (options.assignee) {
    args.push("--assignee", options.assignee);
  }
  if (options.labels?.length) {
    args.push("--label", options.labels.join(","));
  }
  if (options.parent) {
    args.push("--parent", options.parent);
  }

  return jiraExec<T>("workitem create", args);
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
 * Edit a workitem
 */
export async function edit<T = unknown>(
  options: WorkitemEditOptions
): Promise<AcliResult<T>> {
  const args = ["--key", options.key, "--yes"];

  if (options.summary) {
    args.push("--summary", options.summary);
  }
  if (options.descriptionMarkdown) {
    args.push("--description", markdownToAdfString(options.descriptionMarkdown));
  } else if (options.description) {
    args.push("--description", options.description);
  }
  if (options.descriptionFile) {
    args.push("--description-file", options.descriptionFile);
  }
  if (options.assignee) {
    args.push("--assignee", options.assignee);
  }
  if (options.labels) {
    args.push("--labels", options.labels);
  }
  if (options.type) {
    args.push("--type", options.type);
  }

  return jiraExec<T>("workitem edit", args);
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
