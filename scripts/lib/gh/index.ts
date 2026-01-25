/**
 * GitHub CLI (gh) wrapper for workflow development.
 */

import * as workflow from "./workflow";
import * as run from "./run";

// Export base functions and types
export { ghExec, ghJson, ghRaw, type GhResult } from "./base";

// Export all types
export * from "./types";

// Export convenience functions
export {
  runWorkflow,
  runAndWatch,
  getFailedSteps,
  rerunFailed,
  rerunWithDebug,
  downloadArtifacts,
  getLatestRun,
  waitForCompletion,
} from "./convenience";

// Export namespace
export const gh = {
  workflow,
  run,
};

export default gh;
