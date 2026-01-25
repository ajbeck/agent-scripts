/**
 * Base executor for GitHub CLI (gh) commands.
 */

export interface GhResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Execute a gh command and return raw output.
 */
export async function ghExec<T = unknown>(
  args: string[]
): Promise<GhResult<T>> {
  try {
    const result = await Bun.$`gh ${args}`.quiet();
    const stdout = result.stdout.toString().trim();

    if (!stdout) {
      return { success: true };
    }

    // Try to parse as JSON
    try {
      const data = JSON.parse(stdout) as T;
      return { success: true, data };
    } catch {
      // Return raw output if not JSON
      return { success: true, data: stdout as T };
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

/**
 * Execute a gh command with --json flag for structured output.
 */
export async function ghJson<T = unknown>(
  command: string,
  subcommand: string,
  args: string[] = [],
  jsonFields: string[] = []
): Promise<GhResult<T>> {
  const jsonArg = jsonFields.length > 0 ? `--json=${jsonFields.join(",")}` : "--json";
  return ghExec<T>([command, subcommand, ...args, jsonArg]);
}

/**
 * Execute a gh command and return raw text output (no JSON parsing).
 */
export async function ghRaw(args: string[]): Promise<GhResult<string>> {
  try {
    const result = await Bun.$`gh ${args}`.quiet();
    const stdout = result.stdout.toString().trim();
    return { success: true, data: stdout };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
