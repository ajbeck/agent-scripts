# ACLI Base

Low-level command execution for advanced use cases.

## exec(args)

Execute any acli command.

```typescript
const result = await exec(["jira", "issue", "view", "TEAM-123", "--json"]);
```

| Param | Type  | Description                  |
| ----- | ----- | ---------------------------- |
| args  | array | Command arguments (required) |

Returns `{ success: boolean, data?: T, error?: string }`.

## jiraExec(subcommand, args?)

Execute acli jira command with automatic `--json` flag.

```typescript
const result = await jiraExec("issue view", ["TEAM-123"]);
const result = await jiraExec("issue search", ["-jql", "project = TEAM"]);
```

| Param      | Type   | Description                |
| ---------- | ------ | -------------------------- |
| subcommand | string | Jira subcommand (required) |
| args       | array  | Additional arguments       |

Returns `{ success: boolean, data?: T, error?: string }`.

## jiraExecRaw(subcommand, args?)

Execute without JSON parsing (for commands that don't support --json).

```typescript
const output = await jiraExecRaw("issue transition", [
  "TEAM-123",
  "--status",
  "Done",
]);
```

| Param      | Type   | Description                |
| ---------- | ------ | -------------------------- |
| subcommand | string | Jira subcommand (required) |
| args       | array  | Additional arguments       |

Returns raw command output.

## AcliResult Type

All high-level functions return this type:

```typescript
type AcliResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

## Example: Custom Command

```typescript
// Use exec for commands not wrapped by high-level functions
const result = await exec([
  "jira",
  "issue",
  "link",
  "TEAM-123",
  "TEAM-456",
  "--type",
  "blocks",
]);

if (!result.success) {
  console.error(result.error);
}
```
