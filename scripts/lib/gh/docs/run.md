# gh run

List, view, watch, and manage workflow runs.

## run.list(options?)

List recent workflow runs.

```typescript
const result = await gh.run.list();
const result = await gh.run.list({ workflow: "release.yaml", limit: 5 });
const result = await gh.run.list({ status: "failure", branch: "main" });
```

| Option   | Type   | Description                      |
| -------- | ------ | -------------------------------- |
| workflow | string | Filter by workflow name/filename |
| branch   | string | Filter by branch                 |
| user     | string | Filter by user who triggered     |
| event    | string | Filter by trigger event          |
| status   | string | Filter by status/conclusion      |
| commit   | string | Filter by commit SHA             |
| limit    | number | Max runs to fetch (default 20)   |

## run.view(runId)

View run summary as JSON.

```typescript
const result = await gh.run.view(12345);
// result.data: Run
```

## run.viewVerbose(runId)

View run with step details as text.

```typescript
const result = await gh.run.viewVerbose(12345);
console.log(result.data); // Formatted text output
```

## run.getJobs(runId)

Get jobs with steps for a run.

```typescript
const result = await gh.run.getJobs(12345);
for (const job of result.data) {
  console.log(job.name, job.conclusion);
  for (const step of job.steps) {
    console.log(`  ${step.name}: ${step.conclusion}`);
  }
}
```

## run.viewLog(runId)

Get full log for a run.

```typescript
const result = await gh.run.viewLog(12345);
```

## run.viewJobLog(runId, jobId)

Get log for a specific job.

```typescript
const jobs = await gh.run.getJobs(12345);
const log = await gh.run.viewJobLog(12345, jobs.data[0].databaseId);
```

## run.viewLogFailed(runId)

Get log for failed steps only.

```typescript
const result = await gh.run.viewLogFailed(12345);
```

## run.watch(runId, options?)

Watch a run until completion.

```typescript
await gh.run.watch(12345);
await gh.run.watch(12345, { compact: true, exitStatus: true });
```

| Option     | Type    | Description                     |
| ---------- | ------- | ------------------------------- |
| interval   | number  | Poll interval in seconds        |
| compact    | boolean | Show only relevant/failed steps |
| exitStatus | boolean | Exit non-zero if run fails      |

## run.rerun(runId, options?)

Rerun a workflow run.

```typescript
await gh.run.rerun(12345); // Rerun all
await gh.run.rerun(12345, { failed: true }); // Rerun failed jobs only
await gh.run.rerun(12345, { debug: true }); // Rerun with debug logging
await gh.run.rerun(12345, { job: "67890" }); // Rerun specific job
```

| Option | Type    | Description              |
| ------ | ------- | ------------------------ |
| failed | boolean | Rerun only failed jobs   |
| job    | string  | Rerun specific job by ID |
| debug  | boolean | Enable debug logging     |

## run.cancel(runId)

Cancel a running workflow.

```typescript
await gh.run.cancel(12345);
```

## run.download(runId, options?)

Download artifacts from a run.

```typescript
await gh.run.download(12345);
await gh.run.download(12345, { dir: "./artifacts" });
await gh.run.download(12345, { name: "test-results" });
```

| Option | Type   | Description                |
| ------ | ------ | -------------------------- |
| name   | string | Download specific artifact |
| dir    | string | Destination directory      |
