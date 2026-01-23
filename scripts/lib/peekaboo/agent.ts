/**
 * Peekaboo agent command - execute automation tasks using AI
 */

import { peekabooExec, type PeekabooResult } from "./base";

export type AgentModel = "gpt-5.1" | "claude-opus-4-5" | "gemini-3-flash";

export interface AgentOptions {
  /** Natural language task description */
  task?: string;
  /** Maximum steps the agent can take */
  maxSteps?: number;
  /** AI model to use */
  model?: AgentModel;
  /** Resume a specific session by ID */
  resumeSession?: string;
  /** Resume the most recent session */
  resume?: boolean;
  /** Dry run - show planned steps without executing */
  dryRun?: boolean;
  /** Quiet mode - only show final result */
  quiet?: boolean;
  /** List available sessions */
  listSessions?: boolean;
  /** Disable session caching */
  noCache?: boolean;
  /** Start an interactive chat session */
  chat?: boolean;
}

export interface AgentResult {
  success?: boolean;
  sessionId?: string;
  steps?: number;
  result?: string;
}

/**
 * Execute complex automation tasks using the Peekaboo agent
 *
 * @example
 * // Run a task
 * await agent({ task: "Open Safari and navigate to apple.com" });
 *
 * // Dry run to see planned steps
 * await agent({ task: "Take a screenshot", dryRun: true });
 *
 * // Resume previous session
 * await agent({ resume: true });
 */
export async function agent<T = AgentResult>(
  options: AgentOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  // Task (positional)
  if (options.task) {
    args.push(options.task);
  }

  if (options.maxSteps !== undefined) {
    args.push("--max-steps", String(options.maxSteps));
  }
  if (options.model) {
    args.push("--model", options.model);
  }
  if (options.resumeSession) {
    args.push("--resume-session", options.resumeSession);
  }
  if (options.resume) {
    args.push("--resume");
  }
  if (options.dryRun) {
    args.push("--dry-run");
  }
  if (options.quiet) {
    args.push("--quiet");
  }
  if (options.listSessions) {
    args.push("--list-sessions");
  }
  if (options.noCache) {
    args.push("--no-cache");
  }
  if (options.chat) {
    args.push("--chat");
  }

  return peekabooExec<T>("agent", args);
}
