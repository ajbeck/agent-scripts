/**
 * Chrome DevTools Convenience Functions
 *
 * Higher-level functions for common browser automation tasks.
 * These functions handle cleanup automatically (defer pattern).
 */

import { chromeExec, closeChrome } from "./base";
import { navigate, listPages, closePage, waitFor } from "./navigation";
import { screenshot, snapshot } from "./debugging";
import type { TakeScreenshotParams } from "./types";

/**
 * Kill any existing Chrome browser and MCP processes
 * Call this to ensure a clean state before starting
 */
export async function ensureCleanState(): Promise<void> {
  // Close any existing MCP connection
  await closeChrome();

  // Kill browser and MCP processes
  try {
    const { $ } = await import("bun");
    await $`pkill -f "Google Chrome for Testing"`.quiet().nothrow();
    await $`pkill -f "chrome-devtools-mcp"`.quiet().nothrow();
    // Wait for processes to terminate
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch {
    // Ignore errors
  }
}

/**
 * Quit the browser completely
 *
 * Terminates the Chrome browser and MCP server processes.
 */
export async function quitBrowser(): Promise<void> {
  await ensureCleanState();
}

/**
 * Run a function with automatic browser cleanup (defer pattern)
 *
 * The browser is ALWAYS cleaned up after the function completes,
 * whether it succeeds or throws an error.
 *
 * Use `keepOpen: true` only when you want to show the browser
 * to the engineer you're pairing with.
 *
 * @example
 * // Browser cleans up automatically after
 * await withBrowser(async () => {
 *   await chrome.navigate({ url: "https://example.com" });
 *   await chrome.screenshot({ filePath: "/tmp/shot.png" });
 * });
 *
 * @example
 * // Keep browser open to show engineer
 * await withBrowser(async () => {
 *   await chrome.navigate({ url: "https://example.com" });
 * }, { keepOpen: true });
 */
export async function withBrowser<T>(
  fn: () => Promise<T>,
  options: { keepOpen?: boolean } = {}
): Promise<T> {
  const { keepOpen = false } = options;

  // Clean up any lingering browser before starting
  await ensureCleanState();

  try {
    return await fn();
  } finally {
    if (!keepOpen) {
      await quitBrowser();
    }
  }
}

/**
 * Navigate to a URL and take a screenshot
 *
 * Browser is automatically cleaned up after (unless keepOpen: true)
 *
 * @example
 * await navigateAndScreenshot({
 *   url: "https://example.com",
 *   filePath: "/tmp/shot.png"
 * });
 */
export async function navigateAndScreenshot(params: {
  url: string;
  filePath: string;
  waitForText?: string;
  waitTimeout?: number;
  fullPage?: boolean;
  format?: "png" | "jpeg" | "webp";
  quality?: number;
  keepOpen?: boolean;
}): Promise<string> {
  const {
    url,
    filePath,
    waitForText,
    waitTimeout,
    fullPage,
    format,
    quality,
    keepOpen = false,
  } = params;

  return withBrowser(
    async () => {
      await navigate({ url });

      if (waitForText) {
        await waitFor({ text: waitForText, timeout: waitTimeout });
      }

      const screenshotParams: TakeScreenshotParams = { filePath };
      if (fullPage !== undefined) screenshotParams.fullPage = fullPage;
      if (format) screenshotParams.format = format;
      if (quality !== undefined) screenshotParams.quality = quality;

      await screenshot(screenshotParams);
      return filePath;
    },
    { keepOpen }
  );
}

/**
 * Navigate to a URL and get the page snapshot (accessibility tree with UIDs)
 *
 * Browser is automatically cleaned up after (unless keepOpen: true)
 *
 * @example
 * const snap = await navigateAndSnapshot({ url: "https://example.com" });
 */
export async function navigateAndSnapshot(params: {
  url: string;
  waitForText?: string;
  waitTimeout?: number;
  verbose?: boolean;
  keepOpen?: boolean;
}): Promise<string> {
  const { url, waitForText, waitTimeout, verbose, keepOpen = false } = params;

  return withBrowser(
    async () => {
      await navigate({ url });

      if (waitForText) {
        await waitFor({ text: waitForText, timeout: waitTimeout });
      }

      return snapshot({ verbose });
    },
    { keepOpen }
  );
}

/**
 * Take a quick screenshot of a URL (one-liner convenience)
 *
 * Browser is automatically cleaned up after (unless keepOpen: true)
 *
 * @example
 * await quickScreenshot("https://example.com", "/tmp/shot.png");
 */
export async function quickScreenshot(
  url: string,
  filePath: string,
  options: { fullPage?: boolean; keepOpen?: boolean } = {}
): Promise<string> {
  const { fullPage = false, keepOpen = false } = options;

  return withBrowser(
    async () => {
      await navigate({ url });
      await screenshot({ filePath, fullPage });
      return filePath;
    },
    { keepOpen }
  );
}

/**
 * Close all pages/tabs except the first one
 */
export async function closeAllPages(): Promise<void> {
  const result = await listPages();
  if (result.pages && result.pages.length > 1) {
    for (let i = 1; i < result.pages.length; i++) {
      try {
        await closePage({ pageId: result.pages[i].id });
      } catch {
        // Ignore errors closing individual pages
      }
    }
  }
}
