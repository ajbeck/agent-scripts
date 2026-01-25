/**
 * Version information for agent-scripts.
 * Used by setup/update scripts to stamp skills with version info.
 * Reads from VERSION file in repo root.
 */

import { join, dirname } from "path";

const versionFile = join(dirname(import.meta.path.replace("file://", "")), "..", "VERSION");
export const VERSION = (await Bun.file(versionFile).text()).trim();
export const REPOSITORY = "https://github.com/ajbeck/agent-scripts";
