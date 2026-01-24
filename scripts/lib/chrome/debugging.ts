/**
 * Chrome DevTools Debugging
 *
 * Tools for screenshots, snapshots, script evaluation, and console
 */

import { chromeExec } from "./base";
import type {
  TakeSnapshotParams,
  TakeScreenshotParams,
  EvaluateScriptParams,
  ListConsoleMessagesParams,
  GetConsoleMessageParams,
} from "./types";

/**
 * Take a text snapshot of the page (accessibility tree)
 * Returns element UIDs that can be used with click, fill, etc.
 */
export async function snapshot(params: TakeSnapshotParams = {}) {
  return chromeExec("takeSnapshot", params);
}

/**
 * Take a screenshot of the page or element
 * @example screenshot({ path: "/tmp/screen.png" })
 * @example screenshot({ uid: "element-123", format: "jpeg" })
 * @example screenshot({ fullPage: true })
 */
export async function screenshot(params: TakeScreenshotParams = {}) {
  return chromeExec("takeScreenshot", params);
}

/**
 * Execute JavaScript in the page context
 * @example evaluate({ function: "() => document.title" })
 * @example evaluate({ function: "(el) => el.innerText", args: [{ uid: "header" }] })
 */
export async function evaluate(params: EvaluateScriptParams) {
  return chromeExec("evaluateScript", params);
}

/**
 * List console messages since last navigation
 */
export async function listConsoleMessages(params: ListConsoleMessagesParams = {}) {
  return chromeExec("listConsoleMessages", params);
}

/**
 * Get a specific console message by ID
 */
export async function getConsoleMessage(params: GetConsoleMessageParams) {
  return chromeExec("getConsoleMessage", params);
}
