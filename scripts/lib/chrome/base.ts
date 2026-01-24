/**
 * Chrome DevTools MCP Base
 *
 * Runtime setup for chrome-devtools-mcp via mcporter
 */

import { createRuntime } from "mcporter";

type Runtime = Awaited<ReturnType<typeof createRuntime>>;

let runtime: Runtime | null = null;

/**
 * Convert camelCase to snake_case for chrome-devtools-mcp tool names
 */
function toSnakeCase(str: string): string {
  return str.replace(/([a-z\d])([A-Z])/g, "$1_$2").toLowerCase();
}

/**
 * Get or create the Chrome DevTools runtime
 */
export async function getChrome(): Promise<Runtime> {
  if (!runtime) {
    runtime = await createRuntime();
  }
  return runtime;
}

/**
 * Close the Chrome DevTools connection
 */
export async function closeChrome(): Promise<void> {
  if (runtime) {
    try {
      await runtime.close("chrome-devtools");
    } catch {
      // Ignore close errors
    }
    runtime = null;
  }
}

/**
 * Execute a Chrome DevTools tool
 */
export async function chromeExec<T = unknown>(
  toolName: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  // Ensure runtime is created
  if (!runtime) {
    runtime = await createRuntime();
  }

  // Convert camelCase toolName to snake_case for the actual MCP call
  const snakeCaseName = toSnakeCase(toolName);

  // Call tool directly on runtime
  const result = (await runtime.callTool("chrome-devtools", snakeCaseName, {
    args: params,
  })) as {
    content?: Array<{ type: string; text?: string }>;
    isError?: boolean;
  };

  // Handle errors
  if (result.isError) {
    const errorText =
      result.content?.find((c) => c.type === "text")?.text || "Unknown error";
    throw new Error(`Chrome DevTools error: ${errorText}`);
  }

  // Extract text content
  const textContent = result.content?.find((c) => c.type === "text")?.text;
  if (!textContent) {
    return result as T;
  }

  // Try to parse as JSON
  try {
    return JSON.parse(textContent) as T;
  } catch {
    // Return as text if not JSON
    return textContent as T;
  }
}
