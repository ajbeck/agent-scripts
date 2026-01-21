/**
 * ACLI TypeScript Interface
 *
 * Usage:
 *   import { acli } from "./scripts";
 *
 *   const issues = await acli.workitem.search({ jql: "project = TEAM" });
 *   const project = await acli.project.view("TEAM");
 */

import * as workitem from "./workitem";
import * as project from "./project";
import * as board from "./board";

export { exec, jiraExec, jiraExecRaw, type AcliResult } from "./base";

export const acli = {
  workitem,
  project,
  board,
};

export default acli;
