/**
 * Chrome DevTools MCP Interface
 *
 * Usage:
 *   import { chrome } from "./scripts";
 *
 *   // Navigate and take snapshot
 *   await chrome.navigate({ url: "https://example.com" });
 *   const snapshot = await chrome.snapshot();
 *
 *   // Interact with elements (UIDs from snapshot)
 *   await chrome.click({ uid: "button-123" });
 *   await chrome.fill({ uid: "input-456", value: "hello" });
 *
 *   // Take screenshot
 *   await chrome.screenshot({ filePath: "/tmp/screen.png" });
 *
 *   // Clean up
 *   await chrome.close();
 */

// Base exports
export { getChrome, closeChrome, chromeExec } from "./base";

// Convenience exports
export {
  navigateAndScreenshot,
  navigateAndSnapshot,
  closeAllPages,
  quitBrowser,
  withBrowser,
  quickScreenshot,
  ensureCleanState,
} from "./convenience";

// Type exports
export * from "./types";

// Module imports
import * as input from "./input";
import * as navigation from "./navigation";
import * as debugging from "./debugging";
import * as performance from "./performance";
import * as network from "./network";
import * as emulation from "./emulation";
import * as convenience from "./convenience";
import { closeChrome } from "./base";

/**
 * Chrome namespace - Browser automation interface via Chrome DevTools MCP
 */
export const chrome = {
  // Input Automation
  click: input.click,
  hover: input.hover,
  fill: input.fill,
  fillForm: input.fillForm,
  drag: input.drag,
  pressKey: input.pressKey,
  uploadFile: input.uploadFile,
  handleDialog: input.handleDialog,

  // Navigation
  navigate: navigation.navigate,
  newPage: navigation.newPage,
  closePage: navigation.closePage,
  listPages: navigation.listPages,
  selectPage: navigation.selectPage,
  waitFor: navigation.waitFor,

  // Debugging
  snapshot: debugging.snapshot,
  screenshot: debugging.screenshot,
  evaluate: debugging.evaluate,
  listConsoleMessages: debugging.listConsoleMessages,
  getConsoleMessage: debugging.getConsoleMessage,

  // Performance
  startTrace: performance.startTrace,
  stopTrace: performance.stopTrace,
  analyzeInsight: performance.analyzeInsight,

  // Network
  listRequests: network.listRequests,
  getRequest: network.getRequest,

  // Emulation
  emulate: emulation.emulate,
  resize: emulation.resize,

  // Convenience (with automatic cleanup)
  navigateAndScreenshot: convenience.navigateAndScreenshot,
  navigateAndSnapshot: convenience.navigateAndSnapshot,
  quickScreenshot: convenience.quickScreenshot,
  withBrowser: convenience.withBrowser,

  // Cleanup
  closeAllPages: convenience.closeAllPages,
  close: closeChrome,
  quit: convenience.quitBrowser,
  ensureClean: convenience.ensureCleanState,
};

// Export individual modules for direct access
export {
  input,
  navigation,
  debugging,
  performance,
  network,
  emulation,
  convenience,
};
