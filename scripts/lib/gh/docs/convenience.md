# gh convenience

High-level helpers for workflow development. These functions throw on error.

## runWorkflow(name, options?)

Trigger a workflow and return the run ID.

```typescript
const runId = await runWorkflow("release.yaml");
const runId = await runWorkflow("deploy.yaml", {
  inputs: { env: "staging" },
});
```

## runAndWatch(name, options?)

Trigger a workflow and watch until completion.

```typescript
const run = await runAndWatch("test.yaml");
console.log(run.conclusion); // "success" or "failure"
```

## getFailedSteps(runId)

Get failed steps with their logs.

```typescript
const failed = await getFailedSteps(12345);
for (const step of failed) {
  console.log(`${step.jobName} > ${step.stepName}`);
  console.log(step.log);
}
```

Returns `FailedStep[]`:

| Field      | Type   | Description                |
| ---------- | ------ | -------------------------- |
| jobName    | string | Job name                   |
| jobId      | number | Job database ID            |
| stepName   | string | Step name                  |
| stepNumber | number | Step number                |
| log        | string | Log content (if available) |

## rerunFailed(runId)

Rerun only failed jobs.

```typescript
await rerunFailed(12345);
```

## rerunWithDebug(runId)

Rerun with debug logging enabled.

```typescript
await rerunWithDebug(12345);
```

## downloadArtifacts(runId, destDir)

Download all artifacts to a directory.

```typescript
await downloadArtifacts(12345, "./artifacts");
```

## getLatestRun(workflowName)

Get the most recent run for a workflow.

```typescript
const latest = await getLatestRun("release.yaml");
if (latest) {
  console.log(latest.status, latest.conclusion);
}
```

## waitForCompletion(runId, pollInterval?, timeout?)

Wait for a run to complete.

```typescript
const run = await waitForCompletion(12345);
const run = await waitForCompletion(12345, 10000, 1800000); // 10s poll, 30min timeout
```

| Param        | Type   | Default | Description         |
| ------------ | ------ | ------- | ------------------- |
| runId        | number | -       | Run ID              |
| pollInterval | number | 5000    | Poll interval in ms |
| timeout      | number | 600000  | Max wait time in ms |
