/**
 * Agent Scripts Library
 *
 * Usage:
 *   import { acli, markdownToAdf } from "./scripts";
 *
 *   const issues = await acli.workitem.search({ jql: "project = TEAM" });
 *   const adf = markdownToAdf("# Hello");
 */

// ACLI Jira interface
export { acli, exec, jiraExec, jiraExecRaw, type AcliResult } from "./acli";

// Markdown to ADF converter
export {
  markdownToAdf,
  markdownToAdfString,
  type AdfDocument,
} from "./md-to-adf";
