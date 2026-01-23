/**
 * Base executor for peekaboo commands
 */

export interface PeekabooResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Execute a peekaboo command and return parsed JSON result
 */
export async function exec<T = unknown>(
  args: string[],
  options?: { json?: boolean }
): Promise<PeekabooResult<T>> {
  const useJson = options?.json !== false;

  try {
    const fullArgs = useJson ? [...args, "--json"] : args;
    const result = await Bun.$`peekaboo ${fullArgs}`.quiet();
    const stdout = result.stdout.toString().trim();

    if (!stdout) {
      return { success: true };
    }

    if (useJson) {
      try {
        const data = JSON.parse(stdout) as T;
        return { success: true, data };
      } catch {
        // Not JSON, return raw output
        return { success: true, data: stdout as T };
      }
    }

    return { success: true, data: stdout as T };
  } catch (error: unknown) {
    // Try to extract JSON error from stderr/stdout
    if (error && typeof error === "object" && "stderr" in error) {
      const shellError = error as { stderr?: Buffer; stdout?: Buffer };
      const stderr = shellError.stderr?.toString().trim();
      const stdout = shellError.stdout?.toString().trim();
      const output = stderr || stdout;

      if (output) {
        try {
          const parsed = JSON.parse(output);
          if (parsed.error?.message) {
            return { success: false, error: parsed.error.message };
          }
          if (parsed.error) {
            return { success: false, error: String(parsed.error) };
          }
        } catch {
          // Not JSON, use as-is
          if (output) {
            return { success: false, error: output };
          }
        }
      }
    }

    const message =
      error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

/**
 * Execute a peekaboo command with a subcommand
 */
export async function peekabooExec<T = unknown>(
  command: string,
  args: string[] = [],
  options?: { json?: boolean }
): Promise<PeekabooResult<T>> {
  const commandParts = command.split(" ");
  return exec<T>([...commandParts, ...args], options);
}

/**
 * Execute a peekaboo command without JSON output
 */
export async function peekabooExecRaw(
  command: string,
  args: string[] = []
): Promise<PeekabooResult<string>> {
  const commandParts = command.split(" ");
  return exec<string>([...commandParts, ...args], { json: false });
}
