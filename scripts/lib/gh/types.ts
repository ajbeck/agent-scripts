/**
 * Type definitions for GitHub CLI wrapper.
 */

// Run status values
export type RunStatus =
  | "queued"
  | "in_progress"
  | "completed"
  | "requested"
  | "waiting"
  | "pending";

// Run conclusion values
export type RunConclusion =
  | "success"
  | "failure"
  | "cancelled"
  | "skipped"
  | "timed_out"
  | "action_required"
  | "neutral"
  | "stale"
  | "startup_failure";

// Workflow state
export type WorkflowState = "active" | "disabled_manually" | "disabled_inactivity";

// Workflow from gh workflow list --json
export interface Workflow {
  id: number;
  name: string;
  path: string;
  state: WorkflowState;
}

// Run from gh run list --json
export interface Run {
  databaseId: number;
  displayTitle: string;
  name: string;
  number: number;
  status: RunStatus;
  conclusion?: RunConclusion;
  headBranch: string;
  headSha: string;
  event: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  workflowDatabaseId: number;
  workflowName: string;
  attempt: number;
}

// Job from gh run view --json jobs
export interface Job {
  name: string;
  databaseId: number;
  status: string;
  conclusion?: string;
  startedAt?: string;
  completedAt?: string;
  steps: Step[];
}

// Step within a job
export interface Step {
  name: string;
  status: string;
  conclusion?: string;
  number: number;
  startedAt?: string;
  completedAt?: string;
}

// Run with jobs
export interface RunWithJobs extends Run {
  jobs: Job[];
}

// Options for workflow.run()
export interface WorkflowRunOptions {
  ref?: string;
  inputs?: Record<string, string>;
}

// Options for run.list()
export interface RunListOptions {
  workflow?: string;
  branch?: string;
  user?: string;
  event?: string;
  status?: RunStatus | RunConclusion;
  commit?: string;
  limit?: number;
}

// Options for run.watch()
export interface RunWatchOptions {
  interval?: number;
  compact?: boolean;
  exitStatus?: boolean;
}

// Options for run.rerun()
export interface RunRerunOptions {
  failed?: boolean;
  job?: string;
  debug?: boolean;
}

// Options for run.download()
export interface RunDownloadOptions {
  name?: string;
  dir?: string;
}

// Failed step with log content
export interface FailedStep {
  jobName: string;
  jobId: number;
  stepName: string;
  stepNumber: number;
  log?: string;
}
