# Peekaboo Vision

Screenshot and UI element detection functions.

## see(options?)

Capture screenshot and detect UI elements with annotations.

```typescript
const { data } = await peekaboo.see({ annotate: true });
// data.elements contains detected UI elements with IDs

const { data } = await peekaboo.see({ app: "Safari", annotate: true });
```

| Param       | Type    | Description                             |
| ----------- | ------- | --------------------------------------- |
| app         | string  | Target app name (optional)              |
| pid         | number  | Target process ID (optional)            |
| windowTitle | string  | Target window by title (optional)       |
| windowId    | number  | Target window by ID (optional)          |
| annotate    | boolean | Add element annotations to screenshot   |
| path        | string  | Output file path (optional)             |
| mode        | string  | "auto", "screen", "window", "frontmost" |
| screenIndex | number  | Screen to capture (optional)            |
| menubar     | boolean | Include menubar in capture              |

Returns `{ success, data: { path, elements, ... } }`.

## image(options?)

Take a screenshot without element detection.

```typescript
await peekaboo.image({ path: "/tmp/screenshot.png" });
await peekaboo.image({ app: "Safari", path: "/tmp/safari.png" });
await peekaboo.image({ mode: "screen", screenIndex: 0 });
```

| Param       | Type    | Description                             |
| ----------- | ------- | --------------------------------------- |
| app         | string  | Target app name (optional)              |
| pid         | number  | Target process ID (optional)            |
| path        | string  | Output file path                        |
| mode        | string  | "auto", "screen", "window", "frontmost" |
| windowTitle | string  | Target window by title (optional)       |
| windowIndex | number  | Target window by index (optional)       |
| windowId    | number  | Target window by ID (optional)          |
| screenIndex | number  | Screen to capture (optional)            |
| format      | string  | "png" or "jpg"                          |
| retina      | boolean | Capture at retina resolution            |
| analyze     | boolean | Include AI analysis of screenshot       |

Returns `{ success, data: { path } }`.

## Convenience Alternatives

For simpler usage, prefer the convenience functions:

```typescript
// Throws on error, returns elements directly
const elements = await peekaboo.detectElements({ app: "Safari" });

// Managed screenshot with cleanup
const capture = await peekaboo.captureForReview();
// ... use capture.path
await capture.cleanup();
```
