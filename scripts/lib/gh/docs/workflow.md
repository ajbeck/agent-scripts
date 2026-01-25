# gh workflow

List, view, and trigger GitHub Actions workflows.

## workflow.list(all?)

List workflows in the repository.

```typescript
const result = await gh.workflow.list();
// result.data: Workflow[]

// Include disabled workflows
const all = await gh.workflow.list(true);
```

| Param | Type    | Description                |
| ----- | ------- | -------------------------- |
| all   | boolean | Include disabled workflows |

Returns `GhResult<Workflow[]>` with fields: `id`, `name`, `path`, `state`.

## workflow.view(workflow, ref?)

View workflow summary.

```typescript
const result = await gh.workflow.view("release.yaml");
const result = await gh.workflow.view(12345);
const result = await gh.workflow.view("release.yaml", "feature-branch");
```

| Param    | Type             | Description                     |
| -------- | ---------------- | ------------------------------- |
| workflow | string \| number | Workflow name, filename, or ID  |
| ref      | string           | Branch/tag for workflow version |

Returns `GhResult<string>` with workflow summary text.

## workflow.viewYaml(workflow, ref?)

Get workflow YAML content.

```typescript
const result = await gh.workflow.viewYaml("release.yaml");
console.log(result.data); // YAML content
```

| Param    | Type             | Description                     |
| -------- | ---------------- | ------------------------------- |
| workflow | string \| number | Workflow name, filename, or ID  |
| ref      | string           | Branch/tag for workflow version |

Returns `GhResult<string>` with YAML content.

## workflow.run(workflow, options?)

Trigger a workflow_dispatch event.

```typescript
// Basic trigger
await gh.workflow.run("release.yaml");

// With inputs
await gh.workflow.run("deploy.yaml", {
  inputs: { environment: "staging", version: "1.0.0" },
});

// On specific branch
await gh.workflow.run("test.yaml", { ref: "feature-branch" });
```

| Param    | Type               | Description                    |
| -------- | ------------------ | ------------------------------ |
| workflow | string \| number   | Workflow name, filename, or ID |
| options  | WorkflowRunOptions | Optional configuration         |

**WorkflowRunOptions:**

| Field  | Type                   | Description             |
| ------ | ---------------------- | ----------------------- |
| ref    | string                 | Branch or tag to run on |
| inputs | Record<string, string> | Workflow input values   |

Returns `GhResult<void>`.
