# Peekaboo Convenience Functions

High-level helpers that throw on error. Recommended for agents.

## Vision

### captureForReview(options?)

Capture screenshot to managed temp file with automatic cleanup.

```typescript
const capture = await peekaboo.captureForReview();
// Read capture.path with Read tool...
await capture.cleanup();

// With focus preservation (default: true)
const capture = await peekaboo.captureForReview({ preserveFocus: true });
```

Returns `{ path: string, cleanup: () => Promise<void> }`.

### detectElements(options?)

Detect UI elements directly (throws on error).

```typescript
const elements = await peekaboo.detectElements({ app: "Safari" });
// Returns flattened array of elements with id, role, label, bounds
```

### findElement(text, options?)

Find element by text (case-insensitive partial match).

```typescript
const button = await peekaboo.findElement("Submit");
// Returns element with id, role, label, bounds or null
```

### findElements(text, options?)

Find all matching elements.

```typescript
const buttons = await peekaboo.findElements("Button");
```

### waitForElement(text, options?)

Wait for element to appear (default timeout: 10s).

```typescript
const element = await peekaboo.waitForElement("Loading complete", {
  timeout: 5000,
});
```

## Interaction

### clickElement(elementId, options?)

Click element by ID.

```typescript
await peekaboo.clickElement("B1");
await peekaboo.clickElement("B1", { double: true });
```

### clickText(text, options?)

Find and click element by text.

```typescript
await peekaboo.clickText("Submit");
await peekaboo.clickText("OK", { app: "Dialog" });
```

### typeText(text, options?)

Type text (throws on error).

```typescript
await peekaboo.typeText("Hello world");
```

### seeAndClick(text, options?)

Combined see and click workflow.

```typescript
await peekaboo.seeAndClick("Submit Button");
```

## App Control

### launchApp(name)

Launch app and wait until ready.

```typescript
await peekaboo.launchApp("Safari");
```

### quitApp(name, force?)

Quit application.

```typescript
await peekaboo.quitApp("Safari");
await peekaboo.quitApp("Safari", true); // Force quit
```

### withApp(appName, fn, options?)

Run automation within app context.

```typescript
await peekaboo.withApp("Safari", async () => {
  await peekaboo.typeText("https://example.com");
  await peekaboo.hotkey({ keys: ["return"] });
});

// Quit after
await peekaboo.withApp(
  "TextEdit",
  async () => {
    // ...
  },
  { quitAfter: true },
);
```

### quickAppScreenshot(appName, path)

Screenshot specific app.

```typescript
await peekaboo.quickAppScreenshot("Safari", "/tmp/safari.png");
```

## Focus Management

### getFrontmostApp()

Get currently focused app name.

```typescript
const app = await peekaboo.getFrontmostApp();
// Returns: "Safari"
```

### withFocusPreservation(fn)

Run function while preserving focus.

```typescript
await peekaboo.withFocusPreservation(async () => {
  await peekaboo.launchApp("Calculator");
  await peekaboo.click({ query: "5" });
});
// Returns to previously focused app
```
