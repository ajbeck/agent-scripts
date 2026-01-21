/**
 * Base executor for acli commands
 */

export interface AcliResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Execute an acli command and return parsed JSON result
 */
export async function exec<T = unknown>(
  args: string[]
): Promise<AcliResult<T>> {
  try {
    const result = await Bun.$`acli ${args}`.quiet();
    const stdout = result.stdout.toString().trim();

    if (!stdout) {
      return { success: true };
    }

    try {
      const data = JSON.parse(stdout) as T;
      return { success: true, data };
    } catch {
      // Not JSON, return raw output
      return { success: true, data: stdout as T };
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

/**
 * Execute acli jira command with JSON output
 */
export async function jiraExec<T = unknown>(
  subcommand: string,
  args: string[] = []
): Promise<AcliResult<T>> {
  // Split subcommand in case it contains spaces (e.g., "project list")
  const subcommandParts = subcommand.split(" ");
  return exec<T>(["jira", ...subcommandParts, "--json", ...args]);
}

/**
 * Execute acli jira command without JSON (for commands that don't support it)
 */
export async function jiraExecRaw(
  subcommand: string,
  args: string[] = []
): Promise<AcliResult<string>> {
  const subcommandParts = subcommand.split(" ");
  return exec<string>(["jira", ...subcommandParts, ...args]);
}
