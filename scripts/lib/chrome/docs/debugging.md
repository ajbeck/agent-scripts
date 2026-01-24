# Chrome Debugging

Inspection, screenshots, and JavaScript evaluation.

## snapshot(params?)

Take a text snapshot of the page (accessibility tree with UIDs).

```typescript
const snapshot = await chrome.snapshot();
const verbose = await chrome.snapshot({ verbose: true });
```

| Param   | Type    | Description                             |
| ------- | ------- | --------------------------------------- |
| verbose | boolean | Include more element details (optional) |

Returns accessibility tree with element UIDs for interaction.

## screenshot(params)

Take a screenshot of page or element.

```typescript
await chrome.screenshot({ filePath: "/tmp/screen.png" });
await chrome.screenshot({ fullPage: true, filePath: "/tmp/full.png" });
await chrome.screenshot({ uid: "element-123", filePath: "/tmp/element.png" });
await chrome.screenshot({
  filePath: "/tmp/shot.jpg",
  format: "jpeg",
  quality: 80,
});
```

| Param    | Type    | Description                             |
| -------- | ------- | --------------------------------------- |
| filePath | string  | Output file path                        |
| fullPage | boolean | Capture full scrollable page (optional) |
| uid      | string  | Capture specific element (optional)     |
| format   | string  | "png", "jpeg", or "webp" (optional)     |
| quality  | number  | 0-100 for jpeg/webp (optional)          |

## evaluate(params)

Execute JavaScript in page context.

```typescript
const title = await chrome.evaluate({ function: "() => document.title" });
const text = await chrome.evaluate({
  function: "(el) => el.textContent",
  args: [{ uid: "element-123" }],
});
```

| Param    | Type   | Description                                    |
| -------- | ------ | ---------------------------------------------- |
| function | string | JavaScript function as string                  |
| args     | array  | Arguments, can include { uid } refs (optional) |

## listConsoleMessages(params?)

List console messages since last navigation.

```typescript
const messages = await chrome.listConsoleMessages();
const errors = await chrome.listConsoleMessages({ types: ["error", "warn"] });
```

| Param | Type  | Description                                             |
| ----- | ----- | ------------------------------------------------------- |
| types | array | Filter by type: "log", "error", "warn", etc. (optional) |

## getConsoleMessage(params)

Get a specific console message by ID.

```typescript
const msg = await chrome.getConsoleMessage({ messageId: 5 });
```

| Param     | Type   | Description                         |
| --------- | ------ | ----------------------------------- |
| messageId | number | Message ID from listConsoleMessages |
