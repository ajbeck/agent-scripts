/**
 * Agent Scripts Library
 *
 * Usage:
 *   import { acli, markdownToAdf, peekaboo, chrome, webDev, tui, gh } from "./scripts";
 *
 *   const issues = await acli.workitem.search({ jql: "project = TEAM" });
 *   const adf = markdownToAdf("# Hello");
 *   await peekaboo.click({ on: "B1" });
 *   await chrome.navigate({ url: "https://example.com" });
 *   await webDev.captureFullBrowser({ url: "https://example.com" });
 *   await tui.captureTerminal({ app: "ghostty" });
 *   await gh.workflow.run("release.yaml");
 */

// ACLI Jira interface
export { acli, exec, jiraExec, jiraExecRaw, type AcliResult } from "./acli";

// Markdown to ADF converter
export {
  markdownToAdf,
  markdownToAdfString,
  type AdfDocument,
} from "./md-to-adf";

// Peekaboo macOS automation interface
export {
  peekaboo,
  peekabooExec,
  peekabooExecRaw,
  type PeekabooResult,
  // Convenience exports
  captureForReview,
  captureAsBase64,
  cleanupScreenshots,
  detectElements,
  findElement,
  findElements,
  clickText,
  typeText,
  withFocusPreservation,
  getFrontmostApp,
} from "./peekaboo";

// Chrome DevTools browser automation interface
export {
  chrome,
  getChrome,
  closeChrome,
  chromeExec,
  // Convenience exports
  capturePageForReview,
  quickScreenshot,
  navigateAndScreenshot,
  withBrowser,
  quitBrowser,
} from "./chrome";

// Web development (Chrome + Peekaboo combined)
export { webDev, captureFullBrowser, testSession, testResponsive } from "./webdev";

// Terminal UI development
export { tui, captureTerminal, testTUI, runAndCapture } from "./tui";

// GitHub CLI workflow automation
export {
  gh,
  ghExec,
  ghJson,
  ghRaw,
  type GhResult,
  // Convenience exports
  runWorkflow,
  runAndWatch,
  getFailedSteps,
  rerunFailed,
  rerunWithDebug,
  downloadArtifacts,
  getLatestRun,
  waitForCompletion,
} from "./gh";
