# ACLI Board

Search boards and list sprints.

## board.search(options?)

Search boards by name and/or project.

```typescript
const boards = await acli.board.search();
const teamBoards = await acli.board.search({ project: "TEAM" });
const namedBoard = await acli.board.search({ name: "Sprint Board" });
const specific = await acli.board.search({ project: "TEAM", name: "Kanban" });
```

| Param   | Type   | Description                          |
| ------- | ------ | ------------------------------------ |
| project | string | Filter by project key                |
| name    | string | Filter by board name (partial match) |

Returns array of board objects with id, name, type.

## board.get(boardId)

Get board details.

```typescript
const board = await acli.board.get(123);
const board = await acli.board.get("123"); // String also accepted
```

| Param   | Type          | Description         |
| ------- | ------------- | ------------------- |
| boardId | number/string | Board ID (required) |

Returns board details including configuration.

## board.listSprints(boardId)

List all sprints for a board.

```typescript
const sprints = await acli.board.listSprints(123);
```

| Param   | Type          | Description         |
| ------- | ------------- | ------------------- |
| boardId | number/string | Board ID (required) |

Returns array of sprint objects with id, name, state, startDate, endDate.

## Example: Find Active Sprint

```typescript
// Find board for project
const boards = await acli.board.search({ project: "TEAM" });
const board = boards.data[0];

// List sprints
const sprints = await acli.board.listSprints(board.id);
const activeSprint = sprints.data.find((s) => s.state === "active");

// Search issues in active sprint
if (activeSprint) {
  const issues = await acli.workitem.search({
    jql: `sprint = ${activeSprint.id}`,
  });
}
```
