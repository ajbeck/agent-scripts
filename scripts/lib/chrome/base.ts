/**
 * Chrome DevTools MCP Base
 *
 * Runtime setup and proxy management for chrome-devtools-mcp via mcporter
 */

import { createRuntime, createServerProxy } from "mcporter";

type Runtime = Awaited<ReturnType<typeof createRuntime>>;
type ServerProxy = ReturnType<typeof createServerProxy>;

let runtime: Runtime | null = null;
let proxy: ServerProxy | null = null;

/**
 * Get or create the Chrome DevTools proxy
 */
export async function getChrome(): Promise<ServerProxy> {
  if (!runtime) {
    runtime = await createRuntime();
    proxy = createServerProxy(runtime, "chrome-devtools");
  }
  return proxy!;
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
    proxy = null;
  }
}

/**
 * Execute a Chrome DevTools tool
 */
export async function chromeExec<T = unknown>(
  toolName: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const chrome = await getChrome();
  const tool = (chrome as Record<string, Function>)[toolName];
  if (!tool) {
    throw new Error(`Unknown Chrome DevTools tool: ${toolName}`);
  }
  const result = await tool(params);
  return result as T;
}
