# Chrome Convenience Functions

High-level helpers with automatic browser lifecycle management.

## withBrowser(fn, options?)

Run function with automatic browser cleanup (defer pattern).

```typescript
await chrome.withBrowser(async () => {
  await chrome.navigate({ url: "https://example.com" });
  await chrome.click({ uid: "button-123" });
  await chrome.screenshot({ filePath: "/tmp/result.png" });
});
// Browser automatically cleaned up

// Keep browser open for inspection
await chrome.withBrowser(
  async () => {
    await chrome.navigate({ url: "https://example.com" });
  },
  { keepOpen: true },
);
```

| Param            | Type     | Description                        |
| ---------------- | -------- | ---------------------------------- |
| fn               | function | Async function to execute          |
| options.keepOpen | boolean  | Keep browser open after (optional) |

## quickScreenshot(url, filePath, options?)

One-liner to navigate and screenshot.

```typescript
await quickScreenshot("https://example.com", "/tmp/shot.png");
await quickScreenshot("https://example.com", "/tmp/full.png", {
  fullPage: true,
});
```

| Param            | Type    | Description                  |
| ---------------- | ------- | ---------------------------- |
| url              | string  | URL to navigate to           |
| filePath         | string  | Output file path             |
| options.fullPage | boolean | Capture full page (optional) |

## capturePageForReview(params)

Capture webpage to managed temp file with cleanup function.

```typescript
const capture = await capturePageForReview({ url: "https://example.com" });
// Read capture.path...
await capture.cleanup();
```

| Param         | Type    | Description                                  |
| ------------- | ------- | -------------------------------------------- |
| url           | string  | URL to capture                               |
| preserveFocus | boolean | Return focus to previous app (default: true) |

Returns `{ path: string, cleanup: () => Promise<void> }`.

## navigateAndScreenshot(params)

Navigate and screenshot with options.

```typescript
await navigateAndScreenshot({
  url: "https://example.com",
  filePath: "/tmp/shot.png",
  waitForText: "Welcome",
  fullPage: true,
  format: "jpeg",
  quality: 80,
});
```

## navigateAndSnapshot(params)

Navigate and get page structure.

```typescript
const snapshot = await navigateAndSnapshot({
  url: "https://example.com",
  waitForText: "Welcome",
});
```

## Cleanup Functions

```typescript
await chrome.quit(); // Kill browser and MCP server
await chrome.close(); // Disconnect MCP only
await chrome.ensureClean(); // Kill lingering processes before starting
await chrome.closeAllPages(); // Close all tabs except first
await chrome.cleanupScreenshots(); // Delete managed screenshots
```
