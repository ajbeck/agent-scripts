---
name: web-dev-assist
description: Unified workflow for web app development using Chrome DevTools + Peekaboo. Use when testing web UIs, debugging layouts, or automating browser interactions.
source: agent-scripts
version: "1.0.0"
disable-model-invocation: true
---

# Web Development Assistant

Unified workflow combining **Chrome DevTools** (in-page automation) and **Peekaboo** (OS-level control) for comprehensive web app testing and development.

## When to Use This Skill

Invoke `/web-dev-assist` when:

- Testing web application UI/UX
- Debugging layout issues across viewports
- Automating browser interactions that involve both page content AND browser UI
- Need screenshots that include browser chrome (toolbar, URL bar)
- Handling OS-level dialogs (file pickers, auth prompts)

## Quick Start

```typescript
import { webDev } from "./agent-scripts";

// Full browser screenshot (includes toolbar, URL bar)
const capture = await webDev.captureFullBrowser({ url: "https://example.com" });
// Review capture.path...
await capture.cleanup();

// Page-only screenshot (just content)
const capture = await webDev.capturePage({ url: "https://example.com" });

// Interactive testing session
await webDev.testSession({ url: "https://example.com" }, async (session) => {
  await session.clickPage("Login"); // Click in-page element
  await session.fillPage("email", "test@example.com");
  await session.clickBrowser("Allow"); // Click browser dialog
  await session.screenshot("/tmp/result.png");
});
```

## Tool Selection Guide

| Task                         | Use                           | Why                            |
| ---------------------------- | ----------------------------- | ------------------------------ |
| Click button/link on page    | Chrome `click()`              | Precise DOM targeting via UIDs |
| Fill form fields             | Chrome `fill()`               | Direct input injection         |
| Screenshot page content      | Chrome `screenshot()`         | No browser chrome, consistent  |
| Screenshot with browser UI   | Peekaboo `captureForReview()` | Includes toolbar, tabs         |
| Handle file picker dialog    | Peekaboo `click()`            | OS-level dialog                |
| Handle auth/permission popup | Peekaboo `click()`            | Browser-level UI               |
| Check page loaded            | Chrome `waitFor()`            | In-page text detection         |
| Check browser state          | Peekaboo `detectElements()`   | Browser UI elements            |
| Position browser window      | Peekaboo `window.resize()`    | OS window management           |
| Test mobile viewport         | Chrome `emulate()`            | In-page viewport               |

## Workflows

### 1. Capture Page for Review

```typescript
import { capturePageForReview } from "./agent-scripts";

// Just the page content (Chrome)
const capture = await capturePageForReview({ url: "https://example.com" });
// Read capture.path to review...
await capture.cleanup();
```

### 2. Capture Full Browser (with chrome)

```typescript
import { webDev } from "./agent-scripts";

// Includes browser toolbar, URL bar, tabs
const capture = await webDev.captureFullBrowser({ url: "https://example.com" });
// Read capture.path to review...
await capture.cleanup();
```

### 3. Test User Flow

```typescript
import { chrome } from "./agent-scripts";

await chrome.withBrowser(async () => {
  // Navigate
  await chrome.navigate({ url: "https://example.com/login" });

  // Get page structure
  const snap = await chrome.snapshot();
  // snap contains UIDs like "uid=1_5 button 'Sign In'"

  // Fill form using UIDs from snapshot
  await chrome.fill({ uid: "1_2", value: "user@example.com" });
  await chrome.fill({ uid: "1_3", value: "password123" });
  await chrome.click({ uid: "1_5" }); // Sign In button

  // Wait for navigation
  await chrome.waitFor({ text: "Welcome" });

  // Screenshot result
  await chrome.screenshot({ filePath: "/tmp/logged-in.png" });
});
```

### 4. Handle Browser Dialogs (OS-level)

Some dialogs aren't in the page DOM - use Peekaboo:

```typescript
import { chrome, peekaboo } from "./agent-scripts";

await chrome.withBrowser(async () => {
  await chrome.navigate({ url: "https://example.com/upload" });
  await chrome.click({ uid: "upload-button" }); // Triggers file picker

  // File picker is OS-level - use Peekaboo
  await peekaboo.sleep(500); // Wait for dialog

  // Type the file path in the dialog
  await peekaboo.type({ text: "/path/to/file.pdf" });
  await peekaboo.hotkey({ keys: ["Return"] });

  // Continue with Chrome
  await chrome.waitFor({ text: "Upload complete" });
});
```

### 5. Test Responsive Design

```typescript
import { chrome } from "./agent-scripts";

const viewports = [
  { name: "mobile", width: 375, height: 812, isMobile: true },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1920, height: 1080 },
];

await chrome.withBrowser(async () => {
  for (const vp of viewports) {
    await chrome.emulate({ viewport: vp });
    await chrome.navigate({ url: "https://example.com" });
    await chrome.screenshot({
      filePath: `/tmp/${vp.name}.png`,
      fullPage: true,
    });
  }
});
```

### 6. Debug Network Requests

```typescript
import { chrome } from "./agent-scripts";

await chrome.withBrowser(async () => {
  await chrome.navigate({ url: "https://example.com/api-heavy-page" });

  // List API calls
  const requests = await chrome.listRequests({
    resourceTypes: ["fetch", "xhr"],
  });
  console.log("API calls:", requests);

  // Get details of a specific request
  const details = await chrome.getRequest({ reqid: 5 });
  console.log("Request details:", details);
});
```

### 7. Performance Analysis

```typescript
import { chrome } from "./agent-scripts";

await chrome.withBrowser(async () => {
  // Start trace with page reload
  await chrome.navigate({ url: "https://example.com" });
  await chrome.startTrace({ reload: true, autoStop: true });

  // Trace auto-stops after page load
  await chrome.stopTrace({ filePath: "/tmp/trace.json.gz" });

  // Get performance insights
  const insight = await chrome.analyzeInsight({
    insightSetId: "navigation-1",
    insightName: "LCPBreakdown",
  });
  console.log("LCP breakdown:", insight);
});
```

## Combined Chrome + Peekaboo Patterns

### Pattern: Screenshot with Browser Context

```typescript
import { chrome, peekaboo } from "./agent-scripts";

// Use Chrome to navigate and interact
await chrome.withBrowser(
  async () => {
    await chrome.navigate({ url: "https://example.com" });
    await chrome.waitFor({ text: "Welcome" });
  },
  { keepOpen: true },
); // Keep browser open

// Use Peekaboo to capture full browser window
const capture = await peekaboo.captureForReview({
  app: "Google Chrome for Testing",
});
// Review capture.path - includes browser chrome
await capture.cleanup();

// Clean up Chrome
await chrome.quit();
```

### Pattern: Browser Window Management

```typescript
import { chrome, peekaboo } from "./agent-scripts";

// Position browser window before testing
await peekaboo.window.resize({
  app: "Google Chrome for Testing",
  width: 1280,
  height: 720,
});

await chrome.withBrowser(async () => {
  await chrome.navigate({ url: "https://example.com" });
  // Test at specific window size...
});
```

### Pattern: Handle Permission Prompts

```typescript
import { chrome, peekaboo, withFocusPreservation } from "./agent-scripts";

await withFocusPreservation(async () => {
  await chrome.withBrowser(async () => {
    await chrome.navigate({ url: "https://example.com/camera" });

    // Page requests camera permission - browser shows prompt
    await peekaboo.sleep(1000); // Wait for prompt

    // Find and click "Allow" in browser permission dialog
    const elements = await peekaboo.detectElements({
      app: "Google Chrome for Testing",
    });
    const allowBtn = elements.elements.find((e) =>
      e.label?.toLowerCase().includes("allow"),
    );
    if (allowBtn) {
      await peekaboo.clickElement(allowBtn.id);
    }

    // Continue with page interaction
    await chrome.waitFor({ text: "Camera enabled" });
  });
});
```

## Source Files

- `agent-scripts/lib/chrome/` - Chrome DevTools functions
- `agent-scripts/lib/peekaboo/` - Peekaboo macOS functions
- `agent-scripts/lib/webdev/` - Combined convenience functions

## Related Skills

- `/chrome-devtools` - Full Chrome API reference
- `/peekaboo-macos` - Full Peekaboo API reference
