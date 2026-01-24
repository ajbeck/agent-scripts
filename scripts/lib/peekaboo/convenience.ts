/**
 * Peekaboo Convenience Functions
 *
 * Higher-level functions for common macOS automation tasks.
 * These functions throw on error (no need to check .success).
 */

import { peekabooExec, type PeekabooResult } from "./base";
import { see, type SeeOptions } from "./see";
import { image, type ImageOptions } from "./image";
import { click, type ClickOptions } from "./click";
import { type as typeInput, type TypeOptions } from "./input";
import { app } from "./app";

/**
 * UI Element from see() result
 */
export interface UIElement {
  id: string;
  role: string;
  role_description?: string;
  label?: string;
  is_actionable?: boolean;
}

/**
 * Flattened see() result
 */
export interface SeeData {
  elements: UIElement[];
  elementCount: number;
  screenshotPath?: string;
  annotatedPath?: string;
  snapshotId?: string;
  appName?: string;
  windowTitle?: string;
}

/**
 * Unwrap peekaboo result - throws on error
 */
function unwrap<T>(result: PeekabooResult<T>, operation: string): T {
  if (!result.success) {
    throw new Error(`Peekaboo ${operation} failed: ${result.error || "Unknown error"}`);
  }
  // Handle double-nested data from peekaboo CLI
  const data = result.data as any;
  if (data && typeof data === "object" && "data" in data) {
    return data.data as T;
  }
  return result.data as T;
}

/**
 * Take a screenshot of an app or the screen
 *
 * @example
 * await screenshot("/tmp/shot.png");
 * await screenshot("/tmp/safari.png", { app: "Safari" });
 *
 * @throws Error on failure
 */
export async function screenshot(
  path: string,
  options?: Omit<ImageOptions, "path">
): Promise<string> {
  const result = await image({ ...options, path });
  unwrap(result, "screenshot");
  return path;
}

/**
 * Detect UI elements on screen and return them directly
 *
 * @example
 * const elements = await detectElements({ app: "Safari" });
 * const buttons = elements.filter(e => e.role === "button");
 *
 * @throws Error on failure
 */
export async function detectElements(
  options?: SeeOptions
): Promise<SeeData> {
  const result = await see({ annotate: true, ...options });
  const data = unwrap<any>(result, "detectElements");

  return {
    elements: data.ui_elements || [],
    elementCount: data.element_count || 0,
    screenshotPath: data.screenshot_raw,
    annotatedPath: data.screenshot_annotated,
    snapshotId: data.snapshot_id,
    appName: data.application_name,
    windowTitle: data.window_title,
  };
}

/**
 * Find an element by text (label) - case insensitive partial match
 *
 * @example
 * const element = await findElement("Submit");
 * if (element) await clickElement(element.id);
 */
export async function findElement(
  text: string,
  options?: SeeOptions
): Promise<UIElement | undefined> {
  const { elements } = await detectElements(options);
  const lowerText = text.toLowerCase();
  return elements.find(
    (e) => e.label?.toLowerCase().includes(lowerText)
  );
}

/**
 * Find all elements matching text
 */
export async function findElements(
  text: string,
  options?: SeeOptions
): Promise<UIElement[]> {
  const { elements } = await detectElements(options);
  const lowerText = text.toLowerCase();
  return elements.filter(
    (e) => e.label?.toLowerCase().includes(lowerText)
  );
}

/**
 * Find elements by role (button, textField, etc.)
 */
export async function findElementsByRole(
  role: string,
  options?: SeeOptions
): Promise<UIElement[]> {
  const { elements } = await detectElements(options);
  const lowerRole = role.toLowerCase();
  return elements.filter(
    (e) => e.role?.toLowerCase() === lowerRole
  );
}

/**
 * Click an element by ID
 *
 * @example
 * await clickElement("elem_105");
 *
 * @throws Error on failure
 */
export async function clickElement(
  elementId: string,
  options?: Omit<ClickOptions, "on" | "id">
): Promise<void> {
  const result = await click({ ...options, on: elementId });
  unwrap(result, "click");
}

/**
 * Click by text - finds element with matching label and clicks it
 *
 * @example
 * await clickText("Submit");
 * await clickText("OK", { app: "Safari" });
 *
 * @throws Error if element not found or click fails
 */
export async function clickText(
  text: string,
  options?: SeeOptions & Omit<ClickOptions, "on" | "id" | "query">
): Promise<void> {
  const element = await findElement(text, options);
  if (!element) {
    throw new Error(`Element with text "${text}" not found`);
  }
  await clickElement(element.id, options);
}

/**
 * Type text into the focused field
 *
 * @example
 * await typeText("Hello world");
 * await typeText("Hello", { app: "Safari" });
 *
 * @throws Error on failure
 */
export async function typeText(
  text: string,
  options?: Omit<TypeOptions, "text">
): Promise<void> {
  const result = await typeInput({ ...options, text });
  unwrap(result, "type");
}

/**
 * Launch an app and wait for it to be ready
 *
 * @example
 * await launchApp("Safari");
 *
 * @throws Error on failure
 */
export async function launchApp(name: string): Promise<void> {
  const result = await app.launch({ name, waitUntilReady: true });
  unwrap(result, "launch");
}

/**
 * Quit an app
 *
 * @example
 * await quitApp("Safari");
 *
 * @throws Error on failure
 */
export async function quitApp(name: string, force = false): Promise<void> {
  const result = await app.quit({ app: name, force });
  unwrap(result, "quit");
}

/**
 * Run automation with an app - launches app, runs function, optionally quits
 *
 * @example
 * await withApp("Safari", async () => {
 *   await clickText("File");
 *   await screenshot("/tmp/safari-menu.png");
 * });
 *
 * @throws Error on failure
 */
export async function withApp<T>(
  appName: string,
  fn: () => Promise<T>,
  options: { quitAfter?: boolean } = {}
): Promise<T> {
  const { quitAfter = false } = options;

  await launchApp(appName);
  // Small delay for app to fully initialize
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    return await fn();
  } finally {
    if (quitAfter) {
      try {
        await quitApp(appName);
      } catch {
        // Ignore quit errors
      }
    }
  }
}

/**
 * Quick screenshot of an app
 *
 * @example
 * await quickAppScreenshot("Safari", "/tmp/safari.png");
 */
export async function quickAppScreenshot(
  appName: string,
  path: string
): Promise<string> {
  return screenshot(path, { app: appName });
}

/**
 * See and click workflow - detect elements then click by text
 *
 * @example
 * await seeAndClick("Submit", { app: "Safari" });
 */
export async function seeAndClick(
  text: string,
  options?: SeeOptions
): Promise<void> {
  await clickText(text, options);
}

/**
 * Wait for an element with text to appear
 *
 * @example
 * await waitForElement("Loading complete", { app: "Safari", timeout: 10000 });
 */
export async function waitForElement(
  text: string,
  options?: SeeOptions & { timeout?: number; interval?: number }
): Promise<UIElement> {
  const timeout = options?.timeout || 10000;
  const interval = options?.interval || 500;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = await findElement(text, options);
    if (element) {
      return element;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Timeout waiting for element with text "${text}"`);
}
