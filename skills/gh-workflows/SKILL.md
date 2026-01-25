---
name: gh-workflows
description: GitHub Actions workflow development and debugging. Use when building, testing, or troubleshooting GitHub workflows.
source: agent-scripts
version: "0.6.0"
---

# GitHub Workflows Dev Guide

TypeScript interface for GitHub Actions workflow development via the `gh` CLI.

```typescript
import { gh, runAndWatch, getFailedSteps } from "./agent-scripts";
```

## Quick Start

```typescript
// Trigger a workflow and watch it complete
const run = await runAndWatch("release.yaml");
console.log(run.conclusion); // "success" or "failure"

// If it failed, get the failed steps
if (run.conclusion === "failure") {
  const failed = await getFailedSteps(run.databaseId);
  for (const step of failed) {
    console.log(`Failed: ${step.jobName} > ${step.stepName}`);
    console.log(step.log);
  }
}
```

## The Iteration Loop

Workflow development follows a tight feedback loop:

### 1. Trigger

```typescript
// Basic trigger
await gh.workflow.run("test.yaml");

// With inputs
await gh.workflow.run("deploy.yaml", {
  inputs: { environment: "staging" },
});

// Trigger and get run ID
const runId = await runWorkflow("test.yaml");
```

### 2. Watch

```typescript
// Watch until complete (blocking)
await gh.run.watch(runId, { compact: true });

// Or trigger + watch in one call
const run = await runAndWatch("test.yaml");
```

### 3. Debug

```typescript
// Get failed step logs
const failedLog = await gh.run.viewLogFailed(runId);

// Get structured failed steps with logs
const failed = await getFailedSteps(runId);

// View all jobs and steps
const jobs = await gh.run.getJobs(runId);
for (const job of jobs.data) {
  console.log(`${job.name}: ${job.conclusion}`);
}
```

### 4. Fix

Edit workflow YAML, commit, push.

### 5. Retry

```typescript
// Rerun only failed jobs (faster)
await rerunFailed(runId);

// Rerun with debug logging
await rerunWithDebug(runId);

// Full rerun
await gh.run.rerun(runId);
```

## Downloading Artifacts

```typescript
// Download all artifacts from a run
await downloadArtifacts(runId, "./artifacts");

// Download specific artifact
await gh.run.download(runId, { name: "test-results", dir: "./results" });
```

## Common Patterns

### List recent runs for a workflow

```typescript
const runs = await gh.run.list({ workflow: "test.yaml", limit: 5 });
for (const run of runs.data) {
  console.log(`#${run.number} ${run.status} ${run.conclusion || ""}`);
}
```

### Get latest run status

```typescript
const latest = await getLatestRun("release.yaml");
if (latest?.conclusion === "failure") {
  console.log("Latest release failed!");
}
```

### Wait for run completion

```typescript
const runId = await runWorkflow("deploy.yaml");
const completed = await waitForCompletion(runId, 10000, 1800000);
console.log(`Deploy ${completed.conclusion}`);
```

### View workflow YAML

```typescript
const yaml = await gh.workflow.viewYaml("release.yaml");
console.log(yaml.data);
```

## Function Reference

| Function                       | Description                |
| ------------------------------ | -------------------------- |
| `gh.workflow.list()`           | List workflows             |
| `gh.workflow.run(name, opts?)` | Trigger workflow           |
| `gh.workflow.viewYaml(name)`   | Get workflow YAML          |
| `gh.run.list(opts?)`           | List runs                  |
| `gh.run.view(id)`              | Get run details            |
| `gh.run.getJobs(id)`           | Get jobs and steps         |
| `gh.run.viewLogFailed(id)`     | Get failed logs            |
| `gh.run.watch(id, opts?)`      | Watch until complete       |
| `gh.run.rerun(id, opts?)`      | Rerun workflow             |
| `gh.run.download(id, opts?)`   | Download artifacts         |
| `runWorkflow(name)`            | Trigger and get ID         |
| `runAndWatch(name)`            | Trigger + watch            |
| `getFailedSteps(id)`           | Get failed steps with logs |
| `rerunFailed(id)`              | Rerun failed jobs          |
| `rerunWithDebug(id)`           | Rerun with debug           |
| `downloadArtifacts(id, dir)`   | Download all artifacts     |

## Incremental Discovery

For detailed API docs, read the manifest and category docs:

- `agent-scripts/lib/gh/manifest.json` - Function index
- `agent-scripts/lib/gh/docs/workflow.md` - Workflow commands
- `agent-scripts/lib/gh/docs/run.md` - Run commands
- `agent-scripts/lib/gh/docs/convenience.md` - Convenience functions
