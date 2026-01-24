/**
 * Web Development Convenience Functions
 *
 * Unified workflows combining Chrome DevTools and Peekaboo
 * for comprehensive web app testing and development.
 */

import {
  chrome,
  capturePageForReview,
  withBrowser,
  quitBrowser,
} from "../chrome";
import {
  peekaboo,
  captureForReview,
  withFocusPreservation,
  getFrontmostApp,
  detectElements,
  clickElement,
  findElement,
} from "../peekaboo";
import { randomUUID } from "crypto";
import { unlink } from "fs/promises";
import { join } from "path";

const SCREENSHOT_DIR = "/tmp/agent-screenshots";

/**
 * Capture full browser window including chrome (toolbar, URL bar, tabs)
 *
 * Uses Peekaboo to capture the entire browser window, not just page content.
 * Focus is preserved - returns to your original app after capture.
 *
 * @example
 * const capture = await captureFullBrowser({ url: "https://example.com" });
 * // Review capture.path (includes browser UI)
 * await capture.cleanup();
 */
export async function captureFullBrowser(params: {
  url: string;
  waitForText?: string;
  waitTimeout?: number;
}): Promise<{ path: string; cleanup: () => Promise<void> }> {
  const { url, waitForText, waitTimeout } = params;

  return withFocusPreservation(async () => {
    // Navigate with Chrome
    await withBrowser(
      async () => {
        await chrome.navigate({ url });
        if (waitForText) {
          await chrome.waitFor({ text: waitForText, timeout: waitTimeout });
        }
      },
      { keepOpen: true }
    );

    // Capture with Peekaboo (includes browser chrome)
    const capture = await captureForReview({
      app: "Google Chrome for Testing",
      preserveFocus: false, // We're already handling focus
    });

    // Clean up Chrome
    await quitBrowser();

    return capture;
  });
}

/**
 * Capture just the page content (no browser chrome)
 *
 * Uses Chrome DevTools for a clean page-only screenshot.
 * Alias for capturePageForReview with simpler API.
 */
export async function capturePage(params: {
  url: string;
  waitForText?: string;
  waitTimeout?: number;
  fullPage?: boolean;
}): Promise<{ path: string; cleanup: () => Promise<void> }> {
  return capturePageForReview(params);
}

/**
 * Interactive test session combining Chrome and Peekaboo
 *
 * Provides a unified API for interacting with both page content
 * and browser-level UI elements.
 *
 * @example
 * await testSession({ url: "https://example.com" }, async (session) => {
 *   await session.clickPage("Login");
 *   await session.fillPage("email-input", "test@example.com");
 *   await session.clickBrowser("Allow"); // Browser permission dialog
 *   await session.screenshot("/tmp/result.png");
 * });
 */
export async function testSession<T>(
  params: { url: string; waitForText?: string },
  fn: (session: TestSession) => Promise<T>
): Promise<T> {
  const { url, waitForText } = params;

  return withFocusPreservation(async () => {
    // Navigate
    await withBrowser(
      async () => {
        await chrome.navigate({ url });
        if (waitForText) {
          await chrome.waitFor({ text: waitForText });
        }
      },
      { keepOpen: true }
    );

    const session = new TestSession();

    try {
      return await fn(session);
    } finally {
      await quitBrowser();
    }
  });
}

/**
 * Test session providing unified Chrome + Peekaboo methods
 */
class TestSession {
  /**
   * Get page snapshot (Chrome) - returns element UIDs
   */
  async getPageSnapshot(): Promise<string> {
    return chrome.snapshot();
  }

  /**
   * Click element on page by UID (Chrome)
   */
  async clickPage(uid: string): Promise<void> {
    await chrome.click({ uid });
  }

  /**
   * Fill input on page by UID (Chrome)
   */
  async fillPage(uid: string, value: string): Promise<void> {
    await chrome.fill({ uid, value });
  }

  /**
   * Press key in page (Chrome)
   */
  async pressKey(key: string): Promise<void> {
    await chrome.pressKey({ key });
  }

  /**
   * Wait for text on page (Chrome)
   */
  async waitForPage(text: string, timeout?: number): Promise<void> {
    await chrome.waitFor({ text, timeout });
  }

  /**
   * Click element in browser UI by text (Peekaboo)
   * Use for dialogs, permission prompts, browser menus
   */
  async clickBrowser(text: string): Promise<void> {
    const element = await findElement(text, {
      app: "Google Chrome for Testing",
    });
    if (!element) {
      throw new Error(`Browser element with text "${text}" not found`);
    }
    await clickElement(element.id);
  }

  /**
   * Detect browser UI elements (Peekaboo)
   */
  async getBrowserElements() {
    return detectElements({ app: "Google Chrome for Testing" });
  }

  /**
   * Take screenshot of page content (Chrome)
   */
  async screenshot(filePath: string, fullPage = false): Promise<void> {
    await chrome.screenshot({ filePath, fullPage });
  }

  /**
   * Take screenshot including browser chrome (Peekaboo)
   */
  async screenshotWithBrowser(filePath: string): Promise<void> {
    await peekaboo.image({ path: filePath, app: "Google Chrome for Testing" });
  }

  /**
   * Type text using OS-level input (Peekaboo)
   * Use for file dialogs, OS prompts
   */
  async typeOS(text: string): Promise<void> {
    await peekaboo.type({ text });
  }

  /**
   * Press hotkey using OS-level input (Peekaboo)
   */
  async hotkeyOS(keys: string[]): Promise<void> {
    await peekaboo.hotkey({ keys });
  }

  /**
   * Sleep for specified milliseconds
   */
  async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Test responsive design across multiple viewports
 *
 * @example
 * const results = await testResponsive("https://example.com", [
 *   { name: "mobile", width: 375, height: 812, isMobile: true },
 *   { name: "desktop", width: 1920, height: 1080 },
 * ]);
 * // results.mobile = "/tmp/agent-screenshots/mobile-xxx.png"
 * // results.desktop = "/tmp/agent-screenshots/desktop-xxx.png"
 */
export async function testResponsive(
  url: string,
  viewports: Array<{
    name: string;
    width: number;
    height: number;
    isMobile?: boolean;
  }>
): Promise<{ [name: string]: string; cleanup: () => Promise<void> }> {
  const screenshots: { [name: string]: string } = {};
  const filePaths: string[] = [];

  await withFocusPreservation(async () => {
    await withBrowser(async () => {
      for (const vp of viewports) {
        await chrome.emulate({
          viewport: {
            width: vp.width,
            height: vp.height,
            isMobile: vp.isMobile,
          },
        });
        await chrome.navigate({ url });

        const filePath = join(
          SCREENSHOT_DIR,
          `${vp.name}-${randomUUID()}.png`
        );
        await chrome.screenshot({ filePath, fullPage: true });

        screenshots[vp.name] = filePath;
        filePaths.push(filePath);
      }
    });
  });

  return {
    ...screenshots,
    cleanup: async () => {
      for (const path of filePaths) {
        try {
          await unlink(path);
        } catch {
          // Ignore
        }
      }
    },
  };
}

/**
 * Web development namespace
 */
export const webDev = {
  captureFullBrowser,
  capturePage,
  testSession,
  testResponsive,
};
