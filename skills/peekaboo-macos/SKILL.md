---
name: peekaboo-macos
description: Full API reference for peekaboo macOS automation. Use for UI automation, screenshots, clicking, typing, and app control.
source: agent-scripts
version: "1.0.0"
---

# Peekaboo macOS Automation

TypeScript interface for macOS UI automation via the `peekaboo` CLI.

```typescript
import {
  peekaboo,
  screenshot,
  detectElements,
  clickText,
} from "./agent-scripts";
```

## Quick Start - Recommended Patterns

### Capture and Review (Recommended for Agents)

```typescript
// Take screenshot with automatic cleanup
const capture = await captureForReview({ app: "Safari" });

// Read/review the screenshot (use Read tool on capture.path)
// ... agent reviews the image ...

// Clean up when done
await capture.cleanup();
```

**Features:**

- Auto-generates unique temp file path
- Old screenshots (>5 min) auto-cleaned on each capture
- Explicit cleanup when done reviewing
- **Focus preserved** - returns focus to the app you were using

### One-liner Screenshot (Manual Path)

```typescript
// Takes screenshot to specific path - you manage cleanup
await screenshot("/tmp/screen.png");
await quickAppScreenshot("Safari", "/tmp/safari.png");
```

### Detect and Find Elements

```typescript
// Get all UI elements
const data = await detectElements({ app: "Safari" });
console.log(`Found ${data.elementCount} elements`);

// Find element by text (case-insensitive partial match)
const button = await findElement("Submit", { app: "Safari" });
if (button) {
  await clickElement(button.id);
}

// Find elements by role
const buttons = await findElementsByRole("button", { app: "Safari" });
```

### Click by Text (Simplest Interaction)

```typescript
// Detects elements and clicks matching text
await clickText("Submit", { app: "Safari" });
await clickText("OK");
```

### App Automation with Cleanup

```typescript
await withApp("Safari", async () => {
  await clickText("File");
  await screenshot("/tmp/safari-menu.png");
});
```

## Convenience Functions (Recommended)

These functions throw on error - no need to check `.success`.

### captureForReview() - Screenshot with Cleanup (Best for Agents)

```typescript
// Capture screenshot to managed temp file
const capture = await captureForReview({ app: "Safari" });
console.log(capture.path); // /tmp/agent-screenshots/screenshot-xxx.png

// Agent reads the file...

// Clean up when done
await capture.cleanup();

// Or clean up all managed screenshots
await cleanupScreenshots();
```

### captureAsBase64() - Get Image Data Directly

```typescript
// Captures, reads, and cleans up - returns base64 PNG data
const imageData = await captureAsBase64({ app: "Safari" });
// No cleanup needed - temp file already deleted
```

### screenshot() - Take Screenshot (Manual Path)

```typescript
await screenshot("/tmp/screen.png");
await screenshot("/tmp/app.png", { app: "Safari" });
await screenshot("/tmp/retina.png", { retina: true });
```

### quickAppScreenshot() - Screenshot of App (Manual Path)

```typescript
await quickAppScreenshot("Safari", "/tmp/safari.png");
await quickAppScreenshot("Finder", "/tmp/finder.png");
```

### detectElements() - Get UI Elements

```typescript
const data = await detectElements({ app: "Safari" });
// Returns:
// {
//   elements: UIElement[],
//   elementCount: number,
//   screenshotPath: string,
//   annotatedPath: string,
//   snapshotId: string,
//   appName: string,
//   windowTitle: string
// }

// UIElement has: id, role, label, is_actionable
```

### findElement() / findElements() - Search by Text

```typescript
const el = await findElement("Submit"); // First match
const els = await findElements("Button"); // All matches
```

### findElementsByRole() - Search by Role

```typescript
const buttons = await findElementsByRole("button");
const textFields = await findElementsByRole("textField");
```

### clickElement() - Click by ID

```typescript
await clickElement("elem_105");
await clickElement("elem_105", { double: true });
```

### clickText() - Click by Text

```typescript
await clickText("Submit");
await clickText("OK", { app: "Safari" });
```

### typeText() - Type Text

```typescript
await typeText("Hello world");
await typeText("Hello", { app: "Safari" });
```

### launchApp() / quitApp() - App Lifecycle

```typescript
await launchApp("Safari"); // Waits until ready
await quitApp("Safari");
await quitApp("Safari", true); // Force quit
```

### withApp() - App Automation Block

```typescript
await withApp("Safari", async () => {
  await clickText("File");
  await screenshot("/tmp/menu.png");
});

// With auto-quit
await withApp(
  "TextEdit",
  async () => {
    await typeText("Hello");
  },
  { quitAfter: true },
);
```

### waitForElement() - Wait for Element

```typescript
const el = await waitForElement("Loading complete", {
  app: "Safari",
  timeout: 10000,
});
```

## Low-Level API

Use these when you need fine-grained control. Remember to check `.success`.

### Core

```typescript
// Screenshot (returns PeekabooResult)
const result = await peekaboo.image({ path: "/tmp/shot.png" });
if (!result.success) console.error(result.error);

// See UI elements
const { data } = await peekaboo.see({ annotate: true, app: "Safari" });

// List windows/apps
const windows = await peekaboo.list({ type: "windows" });
const apps = await peekaboo.list({ type: "apps" });
```

### Interaction

```typescript
// Click
await peekaboo.click({ on: "B1" });
await peekaboo.click({ coords: { x: 100, y: 200 } });
await peekaboo.click({ text: "Submit" });
await peekaboo.click({ on: "B1", double: true });
await peekaboo.click({ on: "B1", right: true });

// Type
await peekaboo.type({ text: "Hello" });
await peekaboo.type({ text: "Hello", delay: 50 });

// Hotkey
await peekaboo.hotkey({ keys: ["cmd", "c"] });
await peekaboo.hotkey({ keys: ["cmd", "shift", "s"] });

// Press
await peekaboo.press({ key: "enter" });
await peekaboo.press({ key: "escape" });

// Scroll
await peekaboo.scroll({ direction: "down", amount: 3 });

// Move
await peekaboo.move({ x: 500, y: 300 });
await peekaboo.move({ on: "B1" });

// Drag
await peekaboo.drag({ from: { x: 100, y: 100 }, to: { x: 300, y: 300 } });

// Paste
await peekaboo.paste();
```

### System

```typescript
// App control
await peekaboo.app.launch({ name: "Safari" });
await peekaboo.app.quit({ app: "Safari" });
await peekaboo.app.switch({ to: "Finder" });
await peekaboo.app.hide("Safari");
const apps = await peekaboo.app.list();

// Window control
await peekaboo.window.focus({ app: "Safari" });
await peekaboo.window.minimize({ app: "Safari" });
await peekaboo.window.maximize({ app: "Safari" });
await peekaboo.window.resize({ app: "Safari", width: 1200, height: 800 });
await peekaboo.window.close({ app: "Safari" });

// Clipboard
const content = await peekaboo.clipboard.get();
await peekaboo.clipboard.set({ text: "Copied text" });

// Menu
await peekaboo.menu.click({ app: "Safari", path: ["File", "New Window"] });

// Dialog
await peekaboo.dialog.fileOpen({ path: "/path/to/file.txt" });
await peekaboo.dialog.fileSave({ path: "/path/to/save.txt" });

// Open
await peekaboo.open({ url: "https://example.com" });
await peekaboo.open({ path: "/path/to/file.pdf" });

// Space/Mission Control
await peekaboo.space.switch({ index: 2 });
await peekaboo.space.missionControl();
```

### AI Agent

```typescript
await peekaboo.agent({ task: "Open Safari and go to google.com" });
```

## Common Workflows

### Form Filling

```typescript
await withApp("Safari", async () => {
  const elements = await detectElements();
  const nameField = elements.elements.find((e) => e.label?.includes("Name"));
  if (nameField) {
    await clickElement(nameField.id);
    await typeText("John Doe");
  }
  await clickText("Submit");
});
```

### Menu Navigation

```typescript
await peekaboo.menu.click({
  app: "Safari",
  path: ["File", "New Private Window"],
});
await screenshot("/tmp/private-window.png", { app: "Safari" });
```

### Keyboard Shortcuts

```typescript
await peekaboo.hotkey({ keys: ["cmd", "c"] }); // Copy
await peekaboo.hotkey({ keys: ["cmd", "v"] }); // Paste
await peekaboo.hotkey({ keys: ["cmd", "z"] }); // Undo
await peekaboo.hotkey({ keys: ["cmd", "shift", "4"] }); // Screenshot selection
```

## Source Files

- `agent-scripts/lib/peekaboo/index.ts` - Main exports and namespace
- `agent-scripts/lib/peekaboo/convenience.ts` - High-level functions
- `agent-scripts/lib/peekaboo/types.ts` - Type definitions
- `agent-scripts/lib/peekaboo/*.ts` - Individual command modules

## Incremental Discovery

For focused exploration, read the manifest and category docs:

- `scripts/lib/peekaboo/manifest.json` - Function index by category
- `scripts/lib/peekaboo/docs/vision.md` - Screenshots and UI detection
- `scripts/lib/peekaboo/docs/interaction.md` - Click, type, hotkey, scroll
- `scripts/lib/peekaboo/docs/system.md` - App, window, clipboard, menu
- `scripts/lib/peekaboo/docs/list.md` - List apps, windows, screens
- `scripts/lib/peekaboo/docs/convenience.md` - High-level helpers
- `scripts/lib/peekaboo/docs/agent.md` - AI-powered automation
