---
name: chrome-devtools
description: Full API reference for Chrome DevTools browser automation. Use when automating browsers, taking screenshots, web scraping, testing web apps, or debugging performance.
---

# Chrome DevTools Browser Automation

TypeScript interface for browser automation via chrome-devtools-mcp.

```typescript
import { chrome } from "./agent-scripts";
```

## Quick Start

```typescript
// Navigate to a page
await chrome.navigate({ url: "https://example.com" });

// Get page snapshot (returns element UIDs)
const snapshot = await chrome.snapshot();

// Interact with elements using UIDs from snapshot
await chrome.click({ uid: "button-123" });
await chrome.fill({ uid: "input-456", value: "hello@example.com" });
await chrome.pressKey({ key: "Enter" });

// Wait for result and screenshot
await chrome.waitFor({ text: "Success" });
await chrome.screenshot({ filePath: "/tmp/result.png" });

// Clean up
await chrome.close();
```

## Input Automation

### click() - Click Element

```typescript
await chrome.click({ uid: "button-123" });
await chrome.click({ uid: "link-456", dblClick: true });
await chrome.click({ uid: "menu-item", includeSnapshot: true });
```

### fill() - Fill Input Field

```typescript
await chrome.fill({ uid: "email-input", value: "user@example.com" });
await chrome.fill({ uid: "search-box", value: "query text" });
```

### fillForm() - Fill Multiple Fields

```typescript
await chrome.fillForm({
  elements: [
    { uid: "username", value: "john" },
    { uid: "email", value: "john@example.com" },
    { uid: "password", value: "secret123" },
  ],
});
```

### pressKey() - Press Keys

```typescript
await chrome.pressKey({ key: "Enter" });
await chrome.pressKey({ key: "Tab" });
await chrome.pressKey({ key: "Escape" });

// Key combinations
await chrome.pressKey({ key: "Control+A" }); // Select all
await chrome.pressKey({ key: "Control+C" }); // Copy
await chrome.pressKey({ key: "Control+V" }); // Paste
await chrome.pressKey({ key: "Control+Shift+R" }); // Hard refresh
```

### hover() - Hover Over Element

```typescript
await chrome.hover({ uid: "menu-trigger" });
```

### drag() - Drag and Drop

```typescript
await chrome.drag({ from_uid: "draggable", to_uid: "dropzone" });
```

### uploadFile() - File Upload

```typescript
await chrome.uploadFile({ uid: "file-input", filePath: "/path/to/file.pdf" });
```

### handleDialog() - Handle Alerts/Confirms

```typescript
await chrome.handleDialog({ action: "accept" });
await chrome.handleDialog({ action: "dismiss" });
await chrome.handleDialog({ action: "accept", promptText: "user input" });
```

## Navigation

### navigate() - Navigate Page

```typescript
// Go to URL
await chrome.navigate({ url: "https://example.com" });

// Navigate back/forward
await chrome.navigate({ type: "back" });
await chrome.navigate({ type: "forward" });

// Reload
await chrome.navigate({ type: "reload" });
await chrome.navigate({ type: "reload", ignoreCache: true });
```

### newPage() - Open New Tab

```typescript
await chrome.newPage({ url: "https://google.com" });
await chrome.newPage({ url: "https://example.com", timeout: 30000 });
```

### listPages() - List Open Tabs

```typescript
const { pages } = await chrome.listPages();
// pages: [{ id: 1, url: "...", title: "..." }, ...]
```

### selectPage() - Switch Tabs

```typescript
await chrome.selectPage({ pageId: 2 });
await chrome.selectPage({ pageId: 2, bringToFront: true });
```

### closePage() - Close Tab

```typescript
await chrome.closePage({ pageId: 1 });
```

### waitFor() - Wait for Text

```typescript
await chrome.waitFor({ text: "Loading complete" });
await chrome.waitFor({ text: "Success", timeout: 10000 });
```

## Debugging

### snapshot() - Take Page Snapshot

Returns accessibility tree with element UIDs for interaction.

```typescript
const snapshot = await chrome.snapshot();
const snapshot = await chrome.snapshot({ verbose: true });
await chrome.snapshot({ filePath: "/tmp/snapshot.txt" });
```

### screenshot() - Take Screenshot

```typescript
// Viewport screenshot
await chrome.screenshot({ filePath: "/tmp/screen.png" });

// Full page
await chrome.screenshot({ fullPage: true, filePath: "/tmp/full.png" });

// Specific element
await chrome.screenshot({ uid: "element-123", filePath: "/tmp/element.png" });

// Different formats
await chrome.screenshot({ format: "jpeg", quality: 80 });
await chrome.screenshot({ format: "webp", quality: 90 });
```

### evaluate() - Run JavaScript

```typescript
// Get page title
const title = await chrome.evaluate({ function: "() => document.title" });

// Get element text
const text = await chrome.evaluate({
  function: "(el) => el.innerText",
  args: [{ uid: "header-123" }],
});

// Run async code
const data = await chrome.evaluate({
  function: `async () => {
    const response = await fetch('/api/data');
    return response.json();
  }`,
});
```

### listConsoleMessages() - Get Console Output

```typescript
const messages = await chrome.listConsoleMessages();
const errors = await chrome.listConsoleMessages({ types: ["error", "warn"] });
const recent = await chrome.listConsoleMessages({ pageSize: 10 });
```

### getConsoleMessage() - Get Specific Message

```typescript
const message = await chrome.getConsoleMessage({ msgid: 5 });
```

## Performance

### startTrace() - Start Performance Recording

```typescript
// Auto-stop after ~5 seconds
await chrome.startTrace({ reload: true, autoStop: true });

// Manual stop, save to file
await chrome.startTrace({
  reload: true,
  autoStop: false,
  filePath: "/tmp/trace.json.gz",
});
```

### stopTrace() - Stop Recording

```typescript
await chrome.stopTrace();
await chrome.stopTrace({ filePath: "/tmp/trace.json.gz" });
```

### analyzeInsight() - Analyze Performance

```typescript
await chrome.analyzeInsight({
  insightSetId: "navigation-1",
  insightName: "LCPBreakdown",
});

await chrome.analyzeInsight({
  insightSetId: "navigation-1",
  insightName: "DocumentLatency",
});
```

## Network

### listRequests() - List Network Requests

```typescript
const requests = await chrome.listRequests();

// Filter by type
const apiCalls = await chrome.listRequests({
  resourceTypes: ["fetch", "xhr"],
});

// Pagination
const page2 = await chrome.listRequests({ pageSize: 20, pageIdx: 1 });
```

### getRequest() - Get Request Details

```typescript
const details = await chrome.getRequest({ reqid: 5 });

// Save response body
await chrome.getRequest({
  reqid: 5,
  responseFilePath: "/tmp/response.json",
});
```

## Emulation

### emulate() - Device/Network Emulation

```typescript
// Mobile viewport
await chrome.emulate({
  viewport: {
    width: 375,
    height: 812,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
});

// Slow network
await chrome.emulate({ networkConditions: "Slow 3G" });
await chrome.emulate({ networkConditions: "Offline" });

// CPU throttling
await chrome.emulate({ cpuThrottlingRate: 4 });

// Geolocation
await chrome.emulate({
  geolocation: { latitude: 37.7749, longitude: -122.4194 },
});

// Custom user agent
await chrome.emulate({
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)...",
});

// Reset
await chrome.emulate({ viewport: null, geolocation: null });
```

### resize() - Resize Viewport

```typescript
await chrome.resize({ width: 1920, height: 1080 });
await chrome.resize({ width: 375, height: 812 });
```

## Common Workflows

### Form Submission

```typescript
await chrome.navigate({ url: "https://example.com/login" });
await chrome.snapshot();

await chrome.fillForm({
  elements: [
    { uid: "username", value: "john" },
    { uid: "password", value: "secret" },
  ],
});
await chrome.click({ uid: "submit-btn" });

await chrome.waitFor({ text: "Welcome" });
```

### Web Scraping

```typescript
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
```

### Performance Testing

```typescript
await chrome.navigate({ url: "https://example.com" });
await chrome.startTrace({ reload: true, autoStop: true });

// Trace results include insights
await chrome.analyzeInsight({
  insightSetId: "navigation-1",
  insightName: "LCPBreakdown",
});
```

### Mobile Testing

```typescript
await chrome.emulate({
  viewport: { width: 375, height: 812, isMobile: true, hasTouch: true },
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0...)...",
});

await chrome.navigate({ url: "https://example.com" });
await chrome.screenshot({ filePath: "/tmp/mobile.png" });
```

## Source Files

- `agent-scripts/lib/chrome/index.ts` - Main exports
- `agent-scripts/lib/chrome/base.ts` - Runtime setup
- `agent-scripts/lib/chrome/types.ts` - TypeScript types
- `agent-scripts/lib/chrome/*.ts` - Individual modules
