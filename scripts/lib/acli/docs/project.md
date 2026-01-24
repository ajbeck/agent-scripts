# ACLI Project

List and view Jira projects.

## project.list(options?)

List projects.

```typescript
const projects = await acli.project.list();
const recent = await acli.project.list({ recent: true });
const all = await acli.project.list({ limit: 100 });
```

| Param    | Type    | Description                                        |
| -------- | ------- | -------------------------------------------------- |
| recent   | boolean | Show recently viewed (default: true if no options) |
| limit    | number  | Max results                                        |
| paginate | boolean | Enable pagination                                  |

Returns array of project objects with key, name, type, lead.

## project.view(key)

View a single project.

```typescript
const project = await acli.project.view("TEAM");
```

| Param | Type   | Description            |
| ----- | ------ | ---------------------- |
| key   | string | Project key (required) |

Returns project details including description, lead, issue types, etc.

## Example: Find Project Issues

```typescript
// Get project info
const project = await acli.project.view("TEAM");
console.log(`Project: ${project.data.name}`);

// Search issues in project
const issues = await acli.workitem.search({
  jql: `project = ${project.data.key} AND status != Done`,
});
```
