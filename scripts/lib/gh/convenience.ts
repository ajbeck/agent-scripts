/**
 * High-level convenience functions for GitHub workflow development.
 * These functions throw on error instead of returning error states.
 */

import * as workflow from "./workflow";
import * as run from "./run";
import type { Run, Job, FailedStep, WorkflowRunOptions } from "./types";
import type { GhResult } from "./base";

/**
 * Unwrap a GhResult, throwing if not successful.
 */
function unwrap<T>(result: GhResult<T>, operation: string): T {
  if (!result.success) {
    throw new Error(`gh ${operation} failed: ${result.error || "Unknown error"}`);
  }
  return result.data as T;
}

/**
 * Trigger a workflow and return the run ID.
 * Polls for the new run to appear.
 */
export async function runWorkflow(
  workflowName: string,
  options?: WorkflowRunOptions
): Promise<number> {
  // Get current latest run ID before triggering
  const beforeResult = await run.list({ workflow: workflowName, limit: 1 });
  const latestBefore = beforeResult.success && beforeResult.data?.[0]?.databaseId;

  // Trigger workflow
  const triggerResult = await workflow.run(workflowName, options);
  unwrap(triggerResult, `workflow run ${workflowName}`);

  // Poll for new run to appear
  const maxAttempts = 30;
  const pollInterval = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));

    const afterResult = await run.list({ workflow: workflowName, limit: 1 });
    if (afterResult.success && afterResult.data?.[0]) {
      const newRun = afterResult.data[0];
      if (newRun.databaseId !== latestBefore) {
        return newRun.databaseId;
      }
    }
  }

  throw new Error(`Timed out waiting for workflow run to start`);
}

/**
 * Trigger a workflow and watch until completion.
 */
export async function runAndWatch(
  workflowName: string,
  options?: WorkflowRunOptions
): Promise<Run> {
  const runId = await runWorkflow(workflowName, options);

  // Watch the run
  const watchResult = await run.watch(runId, { compact: true, exitStatus: true });
  // watch may fail with exit-status if run failed, that's expected

  // Get final run state
  const viewResult = await run.view(runId);
  return unwrap(viewResult, `run view ${runId}`);
}

/**
 * Get failed steps from a run with their log content.
 */
export async function getFailedSteps(runId: number | string): Promise<FailedStep[]> {
  const jobsResult = await run.getJobs(runId);
  const jobs = unwrap(jobsResult, `run view ${runId} jobs`);

  const failedSteps: FailedStep[] = [];

  for (const job of jobs) {
    if (job.conclusion === "failure") {
      for (const step of job.steps) {
        if (step.conclusion === "failure") {
          // Try to get log for this job
          let log: string | undefined;
          const logResult = await run.viewJobLog(runId, job.databaseId);
          if (logResult.success) {
            log = logResult.data;
          }

          failedSteps.push({
            jobName: job.name,
            jobId: job.databaseId,
            stepName: step.name,
            stepNumber: step.number,
            log,
          });
        }
      }
    }
  }

  return failedSteps;
}

/**
 * Rerun only failed jobs from a run.
 */
export async function rerunFailed(runId: number | string): Promise<void> {
  const result = await run.rerun(runId, { failed: true });
  unwrap(result, `run rerun ${runId} --failed`);
}

/**
 * Rerun a run with debug logging enabled.
 */
export async function rerunWithDebug(runId: number | string): Promise<void> {
  const result = await run.rerun(runId, { debug: true });
  unwrap(result, `run rerun ${runId} --debug`);
}

/**
 * Download all artifacts from a run to a directory.
 */
export async function downloadArtifacts(
  runId: number | string,
  destDir: string
): Promise<void> {
  const result = await run.download(runId, { dir: destDir });
  unwrap(result, `run download ${runId}`);
}

/**
 * Get the most recent run for a workflow.
 */
export async function getLatestRun(workflowName: string): Promise<Run | undefined> {
  const result = await run.list({ workflow: workflowName, limit: 1 });
  if (!result.success) return undefined;
  return result.data?.[0];
}

/**
 * Wait for a run to complete and return its final state.
 */
export async function waitForCompletion(
  runId: number | string,
  pollInterval = 5000,
  timeout = 600000
): Promise<Run> {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const result = await run.view(runId);
    const runData = unwrap(result, `run view ${runId}`);

    if (runData.status === "completed") {
      return runData;
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error(`Timed out waiting for run ${runId} to complete`);
}
