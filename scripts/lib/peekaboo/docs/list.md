# Peekaboo List Functions

Query system information about apps, windows, screens, and permissions.

## list.apps()

List all running applications.

```typescript
const apps = await peekaboo.list.apps();
// Returns: { success: true, data: [{ name, pid, bundleId }, ...] }
```

## list.windows(options)

List windows for an application.

```typescript
const windows = await peekaboo.list.windows({ app: "Safari" });
const detailed = await peekaboo.list.windows({
  app: "Safari",
  includeDetails: ["bounds", "ids"],
});
```

| Param          | Type   | Description                        |
| -------------- | ------ | ---------------------------------- |
| app            | string | Application name (required)        |
| includeDetails | array  | Include "bounds", "ids" (optional) |

Returns window objects with title, index, and optionally bounds/ids.

## list.screens()

List all connected displays.

```typescript
const screens = await peekaboo.list.screens();
// Returns: { success: true, data: [{ index, width, height, x, y, isMain }, ...] }
```

## list.permissions()

Check Peekaboo's system permissions.

```typescript
const perms = await peekaboo.list.permissions();
// Returns: { success: true, data: { screenRecording: true, accessibility: true } }
```

| Permission      | Description                |
| --------------- | -------------------------- |
| screenRecording | Required for screenshots   |
| accessibility   | Required for UI automation |

## list.menubar()

List menu bar status icons.

```typescript
const items = await peekaboo.list.menubar();
// Returns items like Wi-Fi, Battery, Clock, etc.
```

## Example: Find App Windows

```typescript
const apps = await peekaboo.list.apps();
const safari = apps.data.find((a) => a.name === "Safari");

if (safari) {
  const windows = await peekaboo.list.windows({
    app: "Safari",
    includeDetails: ["bounds"],
  });
  console.log(windows.data);
}
```
