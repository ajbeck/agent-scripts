/**
 * Peekaboo TypeScript Interface
 *
 * Usage:
 *   import { peekaboo } from "./scripts";
 *
 *   // Take a screenshot
 *   await peekaboo.image({ path: "/tmp/screenshot.png" });
 *
 *   // Detect UI elements
 *   const { data } = await peekaboo.see({ annotate: true });
 *
 *   // Click on an element
 *   await peekaboo.click({ on: "B1" });
 *
 *   // Launch an app
 *   await peekaboo.app.launch({ name: "Safari" });
 */

// Base exports
export { exec, peekabooExec, peekabooExecRaw, type PeekabooResult } from "./base";

// Convenience exports (recommended for agents)
export {
  screenshot,
  captureForReview,
  captureAsBase64,
  cleanupScreenshots,
  detectElements,
  findElement,
  findElements,
  findElementsByRole,
  clickElement,
  clickText,
  typeText,
  launchApp,
  quitApp,
  withApp,
  quickAppScreenshot,
  seeAndClick,
  waitForElement,
  type UIElement,
  type SeeData,
} from "./convenience";

// Type exports
export * from "./types";

// Module imports
import { image } from "./image";
import { see } from "./see";
import { click } from "./click";
import { type as typeInput } from "./input";
import { hotkey } from "./hotkey";
import { press } from "./press";
import { scroll } from "./scroll";
import { move } from "./move";
import { drag } from "./drag";
import { paste } from "./paste";
import { app } from "./app";
import { window } from "./window";
import { clipboard } from "./clipboard";
import { menu } from "./menu";
import { dialog } from "./dialog";
import { dock } from "./dock";
import { space } from "./space";
import { open } from "./open";
import { agent } from "./agent";
import { list } from "./list";
import { peekabooExec } from "./base";
import * as convenience from "./convenience";

/**
 * Sleep for a specified duration
 */
async function sleep(ms: number) {
  return peekabooExec("sleep", [String(ms)]);
}

/**
 * Peekaboo namespace - macOS automation interface
 */
export const peekaboo = {
  // Core (low-level)
  image,
  see,
  list,
  sleep,

  // Interaction (low-level)
  click,
  type: typeInput,
  hotkey,
  press,
  scroll,
  move,
  drag,
  paste,

  // System (low-level)
  app,
  window,
  clipboard,
  menu,
  dialog,
  dock,
  open,
  space,

  // AI
  agent,

  // Convenience (recommended for agents - throws on error)
  screenshot: convenience.screenshot,
  captureForReview: convenience.captureForReview,
  captureAsBase64: convenience.captureAsBase64,
  cleanupScreenshots: convenience.cleanupScreenshots,
  detectElements: convenience.detectElements,
  findElement: convenience.findElement,
  findElements: convenience.findElements,
  findElementsByRole: convenience.findElementsByRole,
  clickElement: convenience.clickElement,
  clickText: convenience.clickText,
  typeText: convenience.typeText,
  launchApp: convenience.launchApp,
  quitApp: convenience.quitApp,
  withApp: convenience.withApp,
  quickAppScreenshot: convenience.quickAppScreenshot,
  seeAndClick: convenience.seeAndClick,
  waitForElement: convenience.waitForElement,
};

// Export individual modules for direct access
export { image } from "./image";
export { see } from "./see";
export { click } from "./click";
export { type } from "./input";
export { hotkey } from "./hotkey";
export { press } from "./press";
export { scroll } from "./scroll";
export { move } from "./move";
export { drag } from "./drag";
export { paste } from "./paste";
export { app } from "./app";
export { window } from "./window";
export { clipboard } from "./clipboard";
export { menu } from "./menu";
export { dialog } from "./dialog";
export { dock } from "./dock";
export { space } from "./space";
export { open } from "./open";
export { agent } from "./agent";
export { list } from "./list";
