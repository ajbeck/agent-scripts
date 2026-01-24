/**
 * Agent Scripts Library
 *
 * Usage:
 *   import { acli, markdownToAdf, peekaboo, chrome } from "./scripts";
 *
 *   const issues = await acli.workitem.search({ jql: "project = TEAM" });
 *   const adf = markdownToAdf("# Hello");
 *   await peekaboo.click({ on: "B1" });
 *   await chrome.navigate({ url: "https://example.com" });
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
} from "./peekaboo";

// Chrome DevTools browser automation interface
export {
  chrome,
  getChrome,
  closeChrome,
  chromeExec,
} from "./chrome";
