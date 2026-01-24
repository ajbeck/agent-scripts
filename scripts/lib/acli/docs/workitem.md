# ACLI Workitem

Create, search, edit, transition, and comment on Jira issues.

## workitem.create(options)

Create a new workitem.

```typescript
await acli.workitem.create({
  project: "TEAM",
  type: "Task",
  summary: "Fix login bug",
  descriptionMarkdown:
    "## Steps to reproduce\n1. Go to login\n2. Enter invalid password",
});

await acli.workitem.create({
  project: "TEAM",
  type: "Story",
  summary: "User authentication",
  assignee: "john@example.com",
  labels: ["backend", "security"],
  parent: "TEAM-100", // Epic or parent issue
});
```

| Param               | Type   | Description                                         |
| ------------------- | ------ | --------------------------------------------------- |
| project             | string | Project key (required)                              |
| type                | string | Issue type: Task, Story, Bug, Epic, etc. (required) |
| summary             | string | Issue title (required)                              |
| description         | string | Plain text or ADF description                       |
| descriptionMarkdown | string | Markdown (auto-converted to ADF)                    |
| assignee            | string | Assignee email/username                             |
| labels              | array  | Labels to add                                       |
| parent              | string | Parent issue key (for subtasks/stories in epics)    |
| customFields        | object | Custom field values                                 |

## workitem.view(key, fields?)

View a single workitem.

```typescript
const issue = await acli.workitem.view("TEAM-123");
const partial = await acli.workitem.view("TEAM-123", ["summary", "status"]);
```

| Param  | Type   | Description                  |
| ------ | ------ | ---------------------------- |
| key    | string | Issue key (required)         |
| fields | array  | Fields to include (optional) |

## workitem.search(options)

Search workitems using JQL.

```typescript
const issues = await acli.workitem.search({ jql: "project = TEAM" });
const myIssues = await acli.workitem.search({
  jql: "assignee = currentUser() AND status != Done",
  limit: 50,
});
const filtered = await acli.workitem.search({
  filter: "My Open Issues", // Saved filter name
});
```

| Param    | Type    | Description       |
| -------- | ------- | ----------------- |
| jql      | string  | JQL query         |
| filter   | string  | Saved filter name |
| fields   | array   | Fields to include |
| limit    | number  | Max results       |
| paginate | boolean | Enable pagination |

## workitem.edit(options)

Edit workitem(s). Supports batch editing.

```typescript
await acli.workitem.edit({
  key: "TEAM-123",
  summary: "Updated title",
  descriptionMarkdown: "## New description",
});

// Batch edit
await acli.workitem.edit({
  key: ["TEAM-1", "TEAM-2", "TEAM-3"],
  assignee: "jane@example.com",
  labelsToAdd: ["reviewed"],
});
```

| Param               | Type         | Description               |
| ------------------- | ------------ | ------------------------- |
| key                 | string/array | Issue key(s) (required)   |
| summary             | string       | New title                 |
| description         | string       | Plain text or ADF         |
| descriptionMarkdown | string       | Markdown (auto-converted) |
| assignee            | string       | New assignee              |
| labelsToAdd         | array        | Labels to add             |
| labelsToRemove      | array        | Labels to remove          |
| type                | string       | Change issue type         |
| customFields        | object       | Custom field values       |

## workitem.transition(options)

Transition a workitem to a new status.

```typescript
await acli.workitem.transition({ key: "TEAM-123", status: "In Progress" });
await acli.workitem.transition({ key: "TEAM-123", status: "Done" });
```

| Param  | Type   | Description                   |
| ------ | ------ | ----------------------------- |
| key    | string | Issue key (required)          |
| status | string | Target status name (required) |

## workitem.comment.create(options)

Add a comment to a workitem.

```typescript
await acli.workitem.comment.create({
  key: "TEAM-123",
  bodyMarkdown: "## Update\nTask is complete.",
});

await acli.workitem.comment.create({
  key: "TEAM-123",
  body: "Plain text comment",
});
```

| Param        | Type   | Description                       |
| ------------ | ------ | --------------------------------- |
| key          | string | Issue key (required)              |
| body         | string | Plain text comment                |
| bodyMarkdown | string | Markdown (auto-converted to ADF)  |
| bodyFile     | string | Path to file with comment content |
