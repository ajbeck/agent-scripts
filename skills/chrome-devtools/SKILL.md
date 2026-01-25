---
name: chrome-devtools
description: Full API reference for Chrome DevTools browser automation. Use when automating browsers, taking screenshots, web scraping, testing web apps, or debugging performance.
source: agent-scripts
version: "1.0.0"
---

# Chrome DevTools Browser Automation

TypeScript interface for browser automation via chrome-devtools-mcp.

```typescript
import {
  chrome,
  quickScreenshot,
  navigateAndScreenshot,
} from "./agent-scripts";
```

## Quick Start - Recommended Patterns

### Capture and Review (Best for Agents)

```typescript
// Capture webpage to managed temp file, browser cleans up automatically
const capture = await capturePageForReview({ url: "https://example.com" });

// Agent reads capture.path with Read tool...

// Clean up when done reviewing
await capture.cleanup();
```

**Features:**

- Browser and temp files are automatically managed
- Old screenshots (>5 min) auto-cleaned on each capture
- Explicit cleanup when done reviewing
- **Focus preserved** - returns focus to the app you were using

### One-liner Screenshot (Manual Path)

```typescript
// Takes screenshot to your path, browser cleans up automatically
await quickScreenshot("https://example.com", "/tmp/shot.png");
```

### Navigate and Screenshot with Options

```typescript
await navigateAndScreenshot({
  url: "https://example.com",
  filePath: "/tmp/shot.png",
  fullPage: true,
  waitForText: "Welcome", // Optional: wait for text before screenshot
});
```

### Multi-step Workflow (with automatic cleanup)

```typescript
await chrome.withBrowser(async () => {
  await chrome.navigate({ url: "https://example.com" });
  const snapshot = await chrome.snapshot(); // Get element UIDs
  await chrome.click({ uid: "button-123" });
  await chrome.fill({ uid: "input-456", value: "hello@example.com" });
  await chrome.screenshot({ filePath: "/tmp/result.png" });
});
// Browser automatically cleaned up - even if errors occur
```

### Keep Browser Open (to show engineer)

```typescript
await chrome.withBrowser(
  async () => {
    await chrome.navigate({ url: "https://example.com" });
    // Browser stays open for engineer to inspect
  },
  { keepOpen: true },
);
```

## Convenience Functions (Recommended)

These functions handle browser lifecycle automatically - the browser starts fresh and cleans up when done.

### quickScreenshot() - One-liner Screenshot

```typescript
await quickScreenshot("https://example.com", "/tmp/shot.png");
await quickScreenshot("https://example.com", "/tmp/full.png", {
  fullPage: true,
});
```

### navigateAndScreenshot() - Navigate and Screenshot

```typescript
await navigateAndScreenshot({
  url: "https://example.com",
  filePath: "/tmp/shot.png",
  waitForText: "Welcome", // Optional
  fullPage: true, // Optional
  format: "jpeg", // Optional: png, jpeg, webp
  quality: 80, // Optional: 0-100 for jpeg/webp
});
```

### navigateAndSnapshot() - Navigate and Get Page Structure

```typescript
const snapshot = await navigateAndSnapshot({
  url: "https://example.com",
  waitForText: "Welcome", // Optional
});
// Returns accessibility tree with UIDs for interaction
```

### withBrowser() - Multi-step with Cleanup

```typescript
await chrome.withBrowser(async () => {
  // Do multiple operations
  await chrome.navigate({ url: "https://example.com" });
  await chrome.click({ uid: "button-123" });
  await chrome.screenshot({ filePath: "/tmp/result.png" });
});
// Cleanup happens automatically (defer pattern)
```

## Low-Level API

Use these when you need fine-grained control. Remember to call `chrome.quit()` when done.

### Input Automation

```typescript
await chrome.click({ uid: "button-123" });
await chrome.click({ uid: "link-456", dblClick: true });
await chrome.fill({ uid: "email-input", value: "user@example.com" });
await chrome.fillForm({
  elements: [
    { uid: "username", value: "john" },
    { uid: "password", value: "secret123" },
  ],
});
await chrome.pressKey({ key: "Enter" });
await chrome.pressKey({ key: "Control+A" }); // Select all
await chrome.hover({ uid: "menu-trigger" });
await chrome.drag({ from_uid: "draggable", to_uid: "dropzone" });
await chrome.uploadFile({ uid: "file-input", filePath: "/path/to/file.pdf" });
await chrome.handleDialog({ action: "accept" });
```

### Navigation

```typescript
await chrome.navigate({ url: "https://example.com" });
await chrome.navigate({ type: "back" });
await chrome.navigate({ type: "forward" });
await chrome.navigate({ type: "reload", ignoreCache: true });
await chrome.newPage({ url: "https://google.com" });
await chrome.selectPage({ pageId: 2 });
await chrome.closePage({ pageId: 1 });
await chrome.waitFor({ text: "Loading complete", timeout: 10000 });
const { pages } = await chrome.listPages();
```

### Debugging

```typescript
const snapshot = await chrome.snapshot();
const snapshot = await chrome.snapshot({ verbose: true });
await chrome.screenshot({ filePath: "/tmp/screen.png" });
await chrome.screenshot({ fullPage: true, filePath: "/tmp/full.png" });
await chrome.screenshot({ uid: "element-123", filePath: "/tmp/element.png" });
const title = await chrome.evaluate({ function: "() => document.title" });
const messages = await chrome.listConsoleMessages();
const errors = await chrome.listConsoleMessages({ types: ["error", "warn"] });
```

### Performance

```typescript
await chrome.startTrace({ reload: true, autoStop: true });
await chrome.stopTrace({ filePath: "/tmp/trace.json.gz" });
await chrome.analyzeInsight({
  insightSetId: "navigation-1",
  insightName: "LCPBreakdown",
});
```

### Network

```typescript
const requests = await chrome.listRequests();
const apiCalls = await chrome.listRequests({ resourceTypes: ["fetch", "xhr"] });
const details = await chrome.getRequest({ reqid: 5 });
await chrome.getRequest({ reqid: 5, responseFilePath: "/tmp/response.json" });
```

### Emulation

```typescript
// Mobile viewport
await chrome.emulate({
  viewport: { width: 375, height: 812, isMobile: true, hasTouch: true },
});
await chrome.emulate({ networkConditions: "Slow 3G" });
await chrome.emulate({ cpuThrottlingRate: 4 });
await chrome.resize({ width: 1920, height: 1080 });
```

### Cleanup

```typescript
await chrome.quit(); // Kills browser and MCP server
await chrome.close(); // Just disconnects MCP (browser may stay open)
await chrome.ensureClean(); // Kill any lingering browser before starting
```

## Common Workflows

### Form Submission

```typescript
await chrome.withBrowser(async () => {
  await chrome.navigate({ url: "https://example.com/login" });
  const snap = await chrome.snapshot();
  // Use UIDs from snapshot
  await chrome.fillForm({
    elements: [
      { uid: "1_2", value: "john" },
      { uid: "1_4", value: "secret" },
    ],
  });
  await chrome.click({ uid: "1_6" }); // Submit button
  await chrome.waitFor({ text: "Welcome" });
  await chrome.screenshot({ filePath: "/tmp/logged-in.png" });
});
```

### Web Scraping

```typescript
await chrome.withBrowser(async () => {
  await chrome.navigate({ url: "https://example.com/products" });
  await chrome.waitFor({ text: "Products" });
  const data = await chrome.evaluate({
    function: `() => {
      return Array.from(document.querySelectorAll('.product')).map(el => ({
        name: el.querySelector('.name')?.textContent,
        price: el.querySelector('.price')?.textContent,
      }));
    }`,
  });
  console.log(data);
});
```

### Mobile Testing

```typescript
await chrome.withBrowser(async () => {
  await chrome.emulate({
    viewport: { width: 375, height: 812, isMobile: true, hasTouch: true },
  });
  await chrome.navigate({ url: "https://example.com" });
  await chrome.screenshot({ filePath: "/tmp/mobile.png" });
});
```

## Source Files

- `agent-scripts/lib/chrome/index.ts` - Main exports
- `agent-scripts/lib/chrome/convenience.ts` - High-level functions
- `agent-scripts/lib/chrome/base.ts` - Runtime setup
- `agent-scripts/lib/chrome/types.ts` - TypeScript types

## Incremental Discovery

For focused exploration, read the manifest and category docs:

- `scripts/lib/chrome/manifest.json` - Function index by category
- `scripts/lib/chrome/docs/input.md` - Click, fill, drag, keyboard
- `scripts/lib/chrome/docs/navigation.md` - Navigate, pages, waitFor
- `scripts/lib/chrome/docs/debugging.md` - Snapshot, screenshot, evaluate
- `scripts/lib/chrome/docs/performance.md` - Tracing and analysis
- `scripts/lib/chrome/docs/network.md` - Request inspection
- `scripts/lib/chrome/docs/emulation.md` - Device/network emulation
- `scripts/lib/chrome/docs/convenience.md` - High-level helpers
