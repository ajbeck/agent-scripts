# Chrome Input Automation

User input functions for interacting with page elements.

## click(params)

Click on an element by UID from snapshot.

```typescript
await chrome.click({ uid: "button-123" });
await chrome.click({ uid: "link-456", dblClick: true });
```

| Param    | Type    | Description               |
| -------- | ------- | ------------------------- |
| uid      | string  | Element UID from snapshot |
| dblClick | boolean | Double-click (optional)   |

## hover(params)

Hover over an element.

```typescript
await chrome.hover({ uid: "menu-trigger" });
```

| Param | Type   | Description               |
| ----- | ------ | ------------------------- |
| uid   | string | Element UID from snapshot |

## fill(params)

Fill a form field with a value.

```typescript
await chrome.fill({ uid: "email-input", value: "user@example.com" });
```

| Param | Type   | Description               |
| ----- | ------ | ------------------------- |
| uid   | string | Element UID from snapshot |
| value | string | Value to fill             |

## fillForm(params)

Fill multiple form fields at once.

```typescript
await chrome.fillForm({
  elements: [
    { uid: "username", value: "john" },
    { uid: "password", value: "secret123" },
  ],
});
```

| Param    | Type  | Description                     |
| -------- | ----- | ------------------------------- |
| elements | array | Array of { uid, value } objects |

## drag(params)

Drag one element onto another.

```typescript
await chrome.drag({ from_uid: "draggable", to_uid: "dropzone" });
```

| Param    | Type   | Description        |
| -------- | ------ | ------------------ |
| from_uid | string | Source element UID |
| to_uid   | string | Target element UID |

## pressKey(params)

Press a key or key combination.

```typescript
await chrome.pressKey({ key: "Enter" });
await chrome.pressKey({ key: "Control+A" });
```

| Param | Type   | Description                                    |
| ----- | ------ | ---------------------------------------------- |
| key   | string | Key name or combo (e.g., "Enter", "Control+A") |

## uploadFile(params)

Upload a file through a file input element.

```typescript
await chrome.uploadFile({ uid: "file-input", filePath: "/path/to/file.pdf" });
```

| Param    | Type   | Description            |
| -------- | ------ | ---------------------- |
| uid      | string | File input element UID |
| filePath | string | Path to file to upload |

## handleDialog(params)

Handle browser dialogs (alert, confirm, prompt).

```typescript
await chrome.handleDialog({ action: "accept" });
await chrome.handleDialog({ action: "dismiss" });
await chrome.handleDialog({ action: "accept", promptText: "my input" });
```

| Param      | Type   | Description                        |
| ---------- | ------ | ---------------------------------- |
| action     | string | "accept" or "dismiss"              |
| promptText | string | Text for prompt dialogs (optional) |
