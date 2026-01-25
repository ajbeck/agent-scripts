/**
 * GitHub run commands (gh run).
 */

import { ghExec, ghRaw, type GhResult } from "./base";
import type {
  Run,
  RunWithJobs,
  Job,
  RunListOptions,
  RunWatchOptions,
  RunRerunOptions,
  RunDownloadOptions,
} from "./types";

const RUN_JSON_FIELDS = [
  "databaseId",
  "displayTitle",
  "name",
  "number",
  "status",
  "conclusion",
  "headBranch",
  "headSha",
  "event",
  "url",
  "createdAt",
  "updatedAt",
  "startedAt",
  "workflowDatabaseId",
  "workflowName",
  "attempt",
];

/**
 * List recent workflow runs.
 */
export async function list(options?: RunListOptions): Promise<GhResult<Run[]>> {
  const args = ["run", "list", `--json=${RUN_JSON_FIELDS.join(",")}`];

  if (options?.workflow) args.push("--workflow", options.workflow);
  if (options?.branch) args.push("--branch", options.branch);
  if (options?.user) args.push("--user", options.user);
  if (options?.event) args.push("--event", options.event);
  if (options?.status) args.push("--status", options.status);
  if (options?.commit) args.push("--commit", options.commit);
  if (options?.limit) args.push("--limit", String(options.limit));

  return ghExec<Run[]>(args);
}

/**
 * View run summary.
 */
export async function view(runId: number | string): Promise<GhResult<Run>> {
  const args = ["run", "view", String(runId), `--json=${RUN_JSON_FIELDS.join(",")}`];
  return ghExec<Run>(args);
}

/**
 * View run with verbose step information.
 */
export async function viewVerbose(runId: number | string): Promise<GhResult<string>> {
  const args = ["run", "view", String(runId), "--verbose"];
  return ghRaw(args);
}

/**
 * Get jobs for a run.
 */
export async function getJobs(runId: number | string): Promise<GhResult<Job[]>> {
  const result = await ghExec<{ jobs: Job[] }>([
    "run",
    "view",
    String(runId),
    "--json=jobs",
  ]);

  if (!result.success) return result as GhResult<Job[]>;
  return { success: true, data: result.data?.jobs };
}

/**
 * Get full log for a run.
 */
export async function viewLog(runId: number | string): Promise<GhResult<string>> {
  const args = ["run", "view", String(runId), "--log"];
  return ghRaw(args);
}

/**
 * Get log for a specific job.
 */
export async function viewJobLog(
  runId: number | string,
  jobId: number | string
): Promise<GhResult<string>> {
  const args = ["run", "view", String(runId), "--log", "--job", String(jobId)];
  return ghRaw(args);
}

/**
 * Get log for failed steps only.
 */
export async function viewLogFailed(runId: number | string): Promise<GhResult<string>> {
  const args = ["run", "view", String(runId), "--log-failed"];
  return ghRaw(args);
}

/**
 * Watch a run until it completes.
 * Note: This is blocking and outputs to stdout.
 */
export async function watch(
  runId: number | string,
  options?: RunWatchOptions
): Promise<GhResult<void>> {
  const args = ["run", "watch", String(runId)];

  if (options?.interval) args.push("--interval", String(options.interval));
  if (options?.compact) args.push("--compact");
  if (options?.exitStatus) args.push("--exit-status");

  return ghExec<void>(args);
}

/**
 * Rerun a workflow run.
 */
export async function rerun(
  runId: number | string,
  options?: RunRerunOptions
): Promise<GhResult<void>> {
  const args = ["run", "rerun", String(runId)];

  if (options?.failed) args.push("--failed");
  if (options?.job) args.push("--job", options.job);
  if (options?.debug) args.push("--debug");

  return ghExec<void>(args);
}

/**
 * Cancel a running workflow.
 */
export async function cancel(runId: number | string): Promise<GhResult<void>> {
  const args = ["run", "cancel", String(runId)];
  return ghExec<void>(args);
}

/**
 * Download artifacts from a run.
 */
export async function download(
  runId: number | string,
  options?: RunDownloadOptions
): Promise<GhResult<void>> {
  const args = ["run", "download", String(runId)];

  if (options?.name) args.push("--name", options.name);
  if (options?.dir) args.push("--dir", options.dir);

  return ghExec<void>(args);
}
